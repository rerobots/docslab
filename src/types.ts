export interface PreludeMap {
    command?: string;
    destpath?: string;
    repoUrl?: string;
    repoScript?: string;
    urlfile?: string;
    exampleCode?: string;
}

export type PreludeKey = keyof PreludeMap;

export interface HardsharePath {
    hardshareO: string;
    hardshareId: string;
}

export interface CodeRuntimeInfo extends HardsharePath, PreludeMap {
    readOnly: boolean;
}
