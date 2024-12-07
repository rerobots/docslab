import { getCodeRegion } from '../src/util';

test('test simple C++ example with prelude', () => {
    const text = `#include "Arduino.h"
void setup()
{
    Serial.begin(115200);
}
`;
    let [startShowIndex, endShowIndex, maxLine] = getCodeRegion(text, [2, 5]);
    expect(startShowIndex).toEqual(21);
    expect(endShowIndex).toEqual(63);
    expect(maxLine).toEqual(5);

    [startShowIndex, endShowIndex, maxLine] = getCodeRegion(text, [2, -1]);
    expect(startShowIndex).toEqual(21);
    expect(endShowIndex).toEqual(63);
    expect(maxLine).toEqual(5);

    [startShowIndex, endShowIndex, maxLine] = getCodeRegion(text, [1, 5]);
    expect(startShowIndex).toEqual(0);
    expect(endShowIndex).toEqual(63);
    expect(maxLine).toEqual(5);

    // Line counting starts at 1
    expect(() => {
        [startShowIndex, endShowIndex, maxLine] = getCodeRegion(text, [0, 2]);
    }).toThrow(Error);

    // Throw exception if line bound outside code
    expect(() => {
        [startShowIndex, endShowIndex, maxLine] = getCodeRegion(text, [1, 6]);
    }).toThrow(Error);
});
