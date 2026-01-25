import os
import re
import uuid

import mkdocs.plugins
from mkdocs.structure.files import File


try:
    from ._version import __version__
except ImportError:
    __version__ = '0.0.0.dev0+Unknown'


DOCSLAB_VERSION = '0.3.9'
DOCSLAB_URL = (
    f'https://cdn.jsdelivr.net/npm/docslab@{DOCSLAB_VERSION}/dist/index.all.js'
)


class DocslabPlugin(mkdocs.plugins.BasePlugin):
    def __init__(self):
        self.docslab_map = {}

    def on_config(self, config):
        config.extra_javascript.append(DOCSLAB_URL)
        config.extra_javascript.append('js/docslabl.js')
        return config

    def on_files(self, files, config):
        files.append(
            File.generated(
                config=config,
                src_uri='js/docslabl.js',
                content='document.addEventListener("DOMContentLoaded", (event) => { docslab.loadAll(); });',
            )
        )
        return files

    def on_page_markdown(self, markdown, page, config, files):
        patched_markdown = ''
        for line in markdown.splitlines():
            m = re.match(r'(```+|~~~+)[ \t]*([^\n\r]*)', line)
            if m is None:
                patched_markdown += line + os.linesep
                continue
            attr_line = m.group(2)
            attr = attr_line.split()
            has_id = False
            block_id = None
            for it in attr:
                if it.startswith('#'):
                    block_id = it
                    has_id = True
                    break
            if block_id is None:
                block_id = '#dl-' + str(uuid.uuid4())
            if 'docslab' in attr:
                self.docslab_map[block_id] = attr
                if not has_id:
                    if attr[-1] == '}':
                        attr.insert(len(attr) - 1, block_id)
                    else:
                        attr.insert(0, '{')
                        attr.extend([block_id, '}'])

                patched_markdown += m.group(1) + ' ' + ' '.join(attr) + os.linesep
            else:
                patched_markdown += line + os.linesep
        return patched_markdown
