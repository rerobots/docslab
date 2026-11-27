import type { CodeRuntimeInfo, HardsharePath, LayoutType, LineRange, PreludeMap } from './types';
export declare function getCodeRegion(codeBlob: string, lineRange: LineRange, lineEnding?: '\n' | '\r\n'): [number, number, number];
export declare function parseHardsharePath(hspath: string): HardsharePath;
export declare function parseLayout(layout: string): LayoutType;
export declare function parsePrelude(codeBlob: string): PreludeMap;
export declare function parseRootData(root: HTMLDivElement | HTMLPreElement, strict?: boolean): CodeRuntimeInfo | null;
export declare function initCodeRuntimeInfo(readOnly?: boolean, hspath?: string): CodeRuntimeInfo;
