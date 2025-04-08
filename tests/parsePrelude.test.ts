import { JSDOM } from 'jsdom';

import { parseHardsharePath, parsePrelude, parseRootData } from '../src/util';

test('prelude parsing for C++', () => {
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

test('prelude with hardshare path in it', () => {
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

test('hardshare path parsing', () => {
    const text = 'heliumdev/cubecell-draw-demo';
    const result = parseHardsharePath(text);
    expect(result.hardshareO).toEqual('heliumdev');
    expect(result.hardshareId).toEqual('cubecell-draw-demo');
});

test('prelude from HTML dataset that is missing values', () => {
    const { document } = new JSDOM(`
        <!DOCTYPE html>
        <div
            id="emptyExample"
            class="docslab"
        ></div>
`).window;
    const emptyRoot = document.getElementById('emptyExample') as HTMLDivElement;
    expect(parseRootData(emptyRoot)).toBeNull();
});

test('prelude from HTML dataset in repo-style div', () => {
    const { document } = new JSDOM(`
        <!DOCTYPE html>
        <div
            id="repoExample"
            class="docslab"
            data-hardshareo="heliumdev"
            data-hardshareid="cubecell-draw-demo"
            data-path="m/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic/src/main.cpp"
            data-command="source .platformio/penv/bin/activate && cd m/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic && pio run -t upload && pio device monitor"
            data-urlfile="https://raw.githubusercontent.com/helium/longfi-platformio/master/Heltec-CubeCell-Board/examples/cubecell-helium-us915-basic/src/main.cpp"
            data-repo="https://github.com/helium/longfi-platformio.git"
        ></div>
`).window;
    const root = document.getElementById('repoExample') as HTMLDivElement;
    const coderi = parseRootData(root);
    if (coderi === null) {
        throw new Error();
    }
    expect(coderi.hardshareO).toBe('heliumdev');
    expect(coderi.runEnv).toBe('ssh');
    expect(coderi.addons).toEqual(['cmdsh']);
});
