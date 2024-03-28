docslab Sphinx extension
========================

This Sphinx extension uses `docslab <https://github.com/rerobots/docslab>`_
to make code blocks interactive.

First, install it from PyPI::

    pip install sphinx-docslab

Then, add it to your ``conf.py`` file.

.. code-block:: python

    extensions = ['sphinx_docslab']

To create an interactive code block, use the ``docslab`` directive. For example,

.. code-block:: restructuredtext

    .. docslab:: heliumdev/cubecell-draw-demo
        :lang: cpp
        :readonly:
        :command: source .platformio/penv/bin/activate && cd m/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic && pio run -t upload && pio device monitor
        :repo: https://github.com/helium/longfi-platformio.git
        :path: m/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic/src/main.cpp

        #include <Arduino.h>
        #include <stdio.h>

        void setup()
        {
            Serial.begin(115200);
        }

        void loop()
        {
            delay(1000);
            Serial.println("Hola, mundo!");
        }
