import os

project = 'Docslab Examples'
copyright = '2024 rerobots, Inc.'

source_suffix = '.rst'
master_doc = 'index'
html_baseurl = '/examples/sphinx/'

extensions = ['sphinx_docslab']

if 'DOCSLAB_USE_LOCAL' in os.environ:
    html_static_path = ['static']
    docslab_url = 'docslab.all.js'
