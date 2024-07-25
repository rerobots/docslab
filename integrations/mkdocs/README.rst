docslab MkDocs plugin
=====================

This MkDocs plugin uses `docslab <https://github.com/rerobots/docslab>`_
to make code blocks interactive.

First, install it from PyPI::

    pip install mkdocs-docslab

Then, add it to your ``mkdocs.yml`` file.

.. code-block:: yaml

    plugins:
      - docslab

To make a code block interactive, add ``docslab`` to the meta string, e.g., ::

    ```{ .cpp .docslab }
    // hardshare=heliumdev/cubecell-draw-demo
    // command: source .platformio/penv/bin/activate && cd m/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic && pio run -t upload && pio device monitor
    // destpath: m/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic/src/main.cpp
    // repoUrl: https://github.com/helium/longfi-platformio.git
    // ---
    #include "Arduino.h"

    void setup()
    {
        Serial.begin(115200);
    }

    void loop()
    {
        delay(1000);
        Serial.println("Hola, mundo!");
    }
    ```
