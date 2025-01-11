#!/bin/sh -e

if [ "$1" = "check" ]; then
    yarn prettier --check src tests integrations/docusaurus-theme/src

    cd integrations/sphinx
    black --check setup.py sphinx_docslab
    cd ../..

    cd integrations/mkdocs
    black --check setup.py mkdocs_docslab
    cd ../..

    cd integrations/mdbook
    cargo fmt --check
    cd ../..
else
    yarn prettier --write src tests integrations/docusaurus-theme/src

    cd integrations/sphinx
    black setup.py sphinx_docslab
    cd ../..

    cd integrations/mkdocs
    black setup.py mkdocs_docslab
    cd ../..

    cd integrations/mdbook
    cargo fmt
    cd ../..
fi
