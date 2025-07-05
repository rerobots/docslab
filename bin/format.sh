#!/bin/sh -e

if [ "$1" = "check" ]; then
    yarn biome format

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
    yarn biome format --write

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
