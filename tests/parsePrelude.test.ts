import { parseHardsharePath, parsePrelude } from '../src/util';

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
    expect(result.hardshare).toBeUndefined();
    expect(result.command).toBe('pio run -t upload && pio device monitor');
    expect(result.lineRange).toEqual([2, 5]);
    expect(result.runEnv).toBe('ssh');
    expect(result.addons).toEqual(['cmdsh']);
});

test('test prelude with hardshare path in it', () => {
    const text = `// hardshare: heliumdev/cubecell-draw-demo
    // command: pio run -t upload
    // destpath: m/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic/src/main.cpp
    // ---
    int main()
    {
        return 0;
    }
    `;
    const result = parsePrelude(text);
    expect(result.hardshare?.hardshareO).toBe('heliumdev');
    expect(result.hardshare?.hardshareId).toBe('cubecell-draw-demo');
});

test('test hardshare path parsing', () => {
    const text = 'heliumdev/cubecell-draw-demo';
    const result = parseHardsharePath(text);
    expect(result.hardshareO).toEqual('heliumdev');
    expect(result.hardshareId).toEqual('cubecell-draw-demo');
});
