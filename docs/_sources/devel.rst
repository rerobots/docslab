Development of docslab
======================


Documentation
-------------

To build the documentation, ::

  cd doc
  pip install -r requirements.txt -r devel-requirements.txt
  bin/build-examples.sh
  sphinx-autobuild . build

If the `build-examples.sh` command fails due to docslab-related dependencies,
then try again using the `clean` option::

  bin/build-examples.sh clean

This script makes some changes to configurations of integrations and examples
so that local docslab packages are used. Otherwise, building an example will
typically pull from public package registries, e.g., https://pypi.org/project/sphinx-docslab/

.. warning::

  bin/clean-examples.sh uses `git checkout` on example and integration
  configurations, including package.json, and thus will cause unsaved changes
  in these files to be lost.

To reset the example configurations, ::

  cd doc
  bin/clean-examples.sh
