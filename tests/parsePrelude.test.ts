import { parsePrelude } from '../src/util';


test('test prelude parsing for C++', () => {
    const text = `// command: pio run -t upload && pio device monitor
    // destpath: m/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic/src/main.cpp
    // repoUrl: https://github.com/helium/longfi-platformio.git
    // lineRange: 2,5
    // ---
    #include "Arduino.h"
    void setup()
    {
        Serial.begin(115200);
    }
    `;
    const result = parsePrelude(text);
    expect(result.command).toBe('pio run -t upload && pio device monitor');
    expect(result.lineRange).toEqual([2, 5]);
});
