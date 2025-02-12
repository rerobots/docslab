export interface PreludeMapBase {
    command?: string;
    destpath?: string;
    repoUrl?: string;
    repoScript?: string;
    urlfile?: string;
    exampleCode?: string;
    lineRange?: LineRange;
    refUrl?: string;
}
export interface PreludeMap extends PreludeMapBase {
    hardshare?: HardsharePath;
}
export type LineRange = [number, number];
export type PreludeKey = keyof PreludeMap;
export interface HardsharePath {
    hardshareO: string;
    hardshareId: string;
}
export interface CodeRuntimeInfo extends HardsharePath, PreludeMapBase {
    readOnly: boolean;
    startShowIndex?: number;
    endShowIndex?: number;
    maxLine?: number;
}
