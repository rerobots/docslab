export interface PreludeMap {
    command?: string;
    destpath?: string;
    repoUrl?: string;
    repoScript?: string;
    urlfile?: string;
    exampleCode?: string;
    lineRange?: LineRange;

    // Link to include in the sandbox panel. If repoUrl and this are both
    // defined, then refUrl is used. If repoUrl is defined but this is not,
    // then repoUrl is included in the sandbox panel.
    refUrl?: string;
}


// Starting and ending lines of code; the ending can be -1,
// in which case it implies the last line.
export type LineRange = [number, number];

export type PreludeKey = keyof PreludeMap;

export interface HardsharePath {
    hardshareO: string;
    hardshareId: string;
}

export interface CodeRuntimeInfo extends HardsharePath, PreludeMap {
    readOnly: boolean;
    startShowIndex?: number;  // Index corresponding to lineRange[0]
    endShowIndex?: number;  // Index corresponding to lineRange[1]
    maxLine?: number;
}
