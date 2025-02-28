#!/bin/sh -e

cd ..

git checkout \
    integrations/docusaurus-theme/package.json \
    integrations/docusaurus-theme/yarn.lock \
    examples/docusaurus/package.json \
    examples/docusaurus/yarn.lock

rm -rf \
    integrations/mkdocs/build \
    integrations/sphinx/build
