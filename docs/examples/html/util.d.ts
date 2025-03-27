import type { HardsharePath, LineRange, PreludeMap } from './types';
export declare function getCodeRegion(codeBlob: string, lineRange: LineRange, lineEnding?: '\n' | '\r\n'): [number, number, number];
export declare function parseHardsharePath(hspath: string): HardsharePath;
export declare function parsePrelude(codeBlob: string): PreludeMap;
