Examples of docslab in MkDocs
=============================

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


References
----------

* `Source code of this example <https://github.com/rerobots/docslab/tree/main/examples/sphinx>`_
* `Live deployment <https://docslab.org/examples/sphinx/>`_
