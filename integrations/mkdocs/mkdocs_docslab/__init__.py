import mkdocs
from mkdocs.structure.files import File

try:
    from ._version import __version__
except ImportError:
    __version__ = '0.0.0.dev0+Unknown'


DOCSLAB_VERSION = '0.3.9'
DOCSLAB_URL = f'https://cdn.jsdelivr.net/npm/docslab@{DOCSLAB_VERSION}/dist/index.all.js'


class DocslabPlugin(mkdocs.plugins.BasePlugin):
    def __init__(self):
        pass

    def on_config(self, config):
        config.extra_javascript.append(DOCSLAB_URL)
        config.extra_javascript.append('js/docslabl.js')
        return config

    def on_files(self, files, config):
        files.append(File.generated(
            config=config,
            src_uri='js/docslabl.js',
            content='document.addEventListener("DOMContentLoaded", (event) => { docslab.loadAll(); });',
        ))
        return files
