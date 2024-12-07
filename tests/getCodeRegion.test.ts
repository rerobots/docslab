import { getCodeRegion } from '../src/util';

test('test simple C++ example with prelude', () => {
    const text = `#include "Arduino.h"
void setup()
{
    Serial.begin(115200);
}
`;
    const [startShowIndex, endShowIndex, maxLine] = getCodeRegion(text, [2, 5]);
    expect(startShowIndex).toEqual(21);
    expect(endShowIndex).toEqual(63);
    expect(maxLine).toEqual(5);

    const [x, y, autoMaxLine] = getCodeRegion(text, [2, -1]);
    expect(autoMaxLine).toEqual(5);
});
