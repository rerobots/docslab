from __future__ import annotations

from typing import TYPE_CHECKING
import html
import urllib

from docutils import nodes
import sphinx
from sphinx.util.docutils import SphinxDirective

if TYPE_CHECKING:
    from sphinx.application import Sphinx
    from sphinx.util.typing import ExtensionMetadata


logger = sphinx.util.logging.getLogger(__name__)


DOCSLAB_VERSION = '0.3.8'
DOCSLAB_URL = f'https://cdn.jsdelivr.net/npm/docslab@{DOCSLAB_VERSION}/lib/index.all.js'


def install_docslab():
    pass


def is_known_language(lang: str) -> str:
    if lang not in [
        'cpp',
        'py',
    ]:
        raise ValueError(f'unknown language: {lang}')
    return lang

def is_url(x: str) -> str:
    u = urllib.parse.urlparse(x)
    if not (
        (u.scheme == 'http' or u.scheme == 'https')
        and (u.netloc != '')
        and (u.path != '')
    ):
        raise ValueError('must be valid URL')
    return x


class DocslabNode(nodes.Element):
    def __init__(self, hardshare_ref, readonly=False, text=None, lang=None, command=None, path=None, repo=None, urlfile=None):
        self.hardshare_owner, self.hardshare_id = hardshare_ref.split('/')
        self.readonly = readonly
        self.text = text
        self.command = command
        self.path = path
        self.repo = repo
        self.urlfile = urlfile
        super().__init__()

def visit_docslab_html(self, node):
    elem = f'<div class="docslab" data-hardshareo="{node.hardshare_owner}" data-hardshareid="{node.hardshare_id}"'
    if node.readonly:
        elem += ' data-readonly'
    for kw in ['command', 'path', 'repo', 'urlfile']:
        if getattr(node, kw, None):
            elem += f' data-{kw}="{getattr(node, kw)}"'
    elem += '>'
    self.body.append(elem +
        f'<a href="https://rerobots.net/u/{node.hardshare_owner}/{node.hardshare_id}" target="_blank">Try it</a>'
        f'<pre><code>'
    )
    if node.text:
        self.body.append(html.escape(node.text))

def depart_docslab_html(self, node):
    self.body.append('</code></pre></div>')


class DocslabDirective(SphinxDirective):
    has_content = True
    optional_arguments = 6
    option_spec = {
        'readonly': lambda x: x is None,
        'lang': is_known_language,
        'command': lambda x: x,
        'path': lambda x: x,
        'repo': is_url,
        'urlfile': is_url,
    }

    def run(self):
        if self.content:
            text = '\n'.join(self.content)
        else:
            text = None
        return [DocslabNode(
            hardshare_ref=self.arguments[0],
            text=text,
            **self.options
        )]


def setup(app: Sphinx) -> ExtensionMetadata:
    app.add_node(DocslabNode, html=(visit_docslab_html, depart_docslab_html))
    app.add_directive('docslab', DocslabDirective)
    app.add_js_file(DOCSLAB_URL)
    app.add_js_file(None, body='document.addEventListener("DOMContentLoaded", (event) => { docslab.loadAll(); });')
    app.connect
    return {
        'version': sphinx.__display_version__,
        'parallel_read_safe': True,
    }
