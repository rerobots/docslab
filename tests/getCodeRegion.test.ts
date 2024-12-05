import { getCodeRegion } from '../src/util';

test('test simple C++ example with prelude', () => {
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
    const [startShowIndex, endShowIndex, maxLine] = getCodeRegion(text, [2, 5]);
    expect(startShowIndex).toEqual(52);
    expect(endShowIndex).toEqual(223);
    expect(maxLine).toEqual(5);
});
