# Examples of docslab in MkDocs


```{ .py docslab runEnv=py hardshare=test/test }
print("hola")
```

```docslab
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


## References

* [Source code of this example](https://github.com/rerobots/docslab/tree/main/examples/mkdocs)
* [Live deployment](https://docslab.org/examples/mkdocs/)
