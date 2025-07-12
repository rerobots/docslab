import os


project = 'docslab'
copyright = '2025 rerobots, Inc, et al'  # Theme appends "." to copyright declaration, so omit it here to avoid double ".."
author = 'the docslab developers'

html_theme = 'sphinx_book_theme'
html_theme_options = {
    'repository_url': 'https://github.com/rerobots/docslab',
    'path_to_docs': 'doc',
    'use_repository_button': False,
    'use_download_button': False,
    'use_source_button': True,
    'icon_links': [
        {
            'name': 'GitHub',
            'url': 'https://github.com/rerobots/docslab',
            'icon': 'fa-brands fa-square-github',
            'type': 'fontawesome',
        },
        {
            'name': 'rerobots',
            'url': 'https://docs.rerobots.net/',
            'icon': '/_static/logo.svg',
            'type': 'local',
        }
    ],
}
html_title = 'docslab'
html_favicon = 'static/favicon.ico'

source_suffix = '.rst'
master_doc = 'index'
html_static_path = ['static']
templates_path = ['templates']
if 'DOCSLAB_ANALYTICS_ID' in os.environ:
    html_context = {
        'DOCSLAB_ANALYTICS_ID': os.environ['DOCSLAB_ANALYTICS_ID'],
    }

extensions = [
    'sphinx_mdinclude',
]
