docslab
=======

Summary
-------

The aim of this project is to support learning and development by making
documentation about robots and electronics interactive.
Run examples on real hardware in a safe and reproducible way.

https://www.npmjs.com/package/docslab

There are three ways to use docslab:

1. copy-and-paste some code into your HTML file,
2. import docslab as a TypeScript/ES6 dependency,
3. use an integration for frameworks like Sphinx or Docusaurus.


Integrations
------------

* Docusaurus, https://www.npmjs.com/package/docslab-docusaurus
* mdBook, https://crates.io/crates/mdbook-docslab
* MkDocs, https://pypi.org/project/mkdocs-docslab/
* Sphinx, https://pypi.org/project/sphinx-docslab/


Contributing to docslab itself
------------------------------

Please report errors, odd behavior, or feature requests at
<https://github.com/rerobots/docslab/issues>

Current [CI report](https://github.com/rerobots/docslab/actions/workflows/main.yml):
![build status from GitHub Actions](https://github.com/rerobots/docslab/actions/workflows/main.yml/badge.svg)

For local development, clone the repository, and then `yarn install`.
To run the examples,

    yarn start

and open the displayed URL (likely <http://localhost:8080/>) in your browser.


### Implementation notes

Generated HTML has a `<div>` block with attributes that specify how to prepare
the runtime environment. Optionally, the example code can be given at a URL
declared among these attributes, or it can be written in a `<code>` block
inside the main `<div>`.


License
-------

This is free software, released under the Apache License, Version 2.0.
You may obtain a copy of the License at https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied.  See the License for the
specific language governing permissions and limitations under the License.
