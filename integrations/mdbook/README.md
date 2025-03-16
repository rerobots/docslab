docslab mdBook preprocessor
===========================

This [mdBook](https://rust-lang.github.io/mdBook/) preprocessor uses
[docslab](https://github.com/rerobots/docslab)
to make code blocks interactive.

First, install the [mdbook-docslab](https://crates.io/crates/mdbook-docslab)
crate:

    cargo install mdbook-docslab

Then, configure your book source to use it,

    mdbook-docslab install path/to/your/book

which will not modify existing values if the book is already using docslab.
In other words, it is safe to run `mdbook-docslab install` more than once.

To make a code block interactive, add `docslab` to the info string, e.g.,

    ```cpp docslab
    // hardshare: heliumdev/cubecell-draw-demo
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
