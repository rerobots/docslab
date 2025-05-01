#!/bin/sh -e
#
# Usage:
#
#     build-examples.sh [clean]
#
# Try to use this without "clean" first. If an error occurs involving
# links or dependencies, try `bin/build-examples.sh clean`

mkdir -p build/examples

echo "Building docslab JS package..."
cd ..
yarn clean
yarn install --frozen-lockfile
yarn build:release
cd doc

echo "Building Docusaurus example..."
cd ../integrations/docusaurus-theme
if [ "$1" = "clean" ]; then
    yarn clean
    rm -rf node_modules
fi
yarn add link:../..
yarn install
yarn build
cd ../..
cd examples/docusaurus
if [ "$1" = "clean" ]; then
    rm -rf node_modules
fi
yarn add link:../../integrations/docusaurus-theme
yarn install
yarn build
cd ../../doc

echo "Building Sphinx example..."
cd ../integrations/sphinx
pip install .
cd ../..
cd examples/sphinx
mkdir -p static
cp ../../dist/index.all.js static/docslab.all.js
pip install sphinx
export DOCSLAB_USE_LOCAL=1
sphinx-build . build
cd ../../doc

echo "Building MkDocs example..."
cd ../integrations/mkdocs
pip install .
cd ../..
cd examples/mkdocs
pip install mkdocs
pip install mkdocs-docslab
mkdocs build
cd ../../doc

echo "Building mdBook example..."
cd ../integrations/mdbook
cargo install mdbook
cargo install --path .
cd ../..
cd examples/mdbook
mdbook-docslab install .
mdbook build
cd ../../doc

echo "Building simple HTML examples..."
cd ..
yarn install
yarn run webpack build --env fullBundle --env example
mv lib examples-html
cd doc

echo "Gathering the examples..."
mv ../examples/docusaurus/build build/examples/docusaurus
mv ../examples/sphinx/build build/examples/sphinx
mv ../examples/mkdocs/site build/examples/mkdocs
mv ../examples/mdbook/book build/examples/mdbook
mv ../examples-html build/examples/html
echo "Done."