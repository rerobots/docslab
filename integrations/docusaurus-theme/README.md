# docslab Docusaurus theme

This [Docusaurus theme](https://docusaurus.io/docs/advanced/plugins) uses
[docslab](https://github.com/rerobots/docslab) to make [fenced code blocks](
https://spec.commonmark.org/0.30/#fenced-code-blocks) interactive.


To get started, add the [docslab-docusaurus](https://www.npmjs.com/package/docslab-docusaurus) package to your docs sources:

    yarn add docslab-docusaurus

or if using NPM, `npm install --save docslab-docusaurus`. Then, add it to the themes list in your docusaurus.config.js

    // ...
    themes: [
        // ...
        'docslab-docusaurus',
    ],


To make a code block interactive, add `docslab` to the language meta string, e.g.,

    ```cpp docslab hardshare=heliumdev/cubecell-draw-demo
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

or use the JSX component without Markdown, e.g.,

    import { DocslabCodeBlock } from 'docslab-docusaurus/lib/theme/DocslabCodeBlock'

    <DocslabCodeBlock
      hardshare="heliumdev/cubecell-draw-demo"
      className="language-cpp"
      command="source .platformio/penv/bin/activate && cd m/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic && pio run -t upload && pio device monitor"
      destpath="m/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic/src/main.cpp"
      repoUrl="https://github.com/helium/longfi-platformio.git"
      urlfile="https://raw.githubusercontent.com/helium/longfi-platformio/master/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic/src/main.cpp"
    />