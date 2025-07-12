export interface PreludeMapBase {
    command?: string;
    destpath?: string;
    repoUrl?: string;
    repoScript?: string;
    urlfile?: string;
    exampleCode?: string;
    lineRange?: LineRange;
    refUrl?: string;
    runEnv: RunEnvType;
    addons?: string[];
}
export interface PreludeMap extends PreludeMapBase {
    hardshare?: HardsharePath;
}
export type LineRange = [number, number];
type RunEnvType = 'py' | 'ssh';
export type PreludeKey = keyof PreludeMap;
export type PreludeValue = string & string[] & LineRange & RunEnvType;
export interface HardsharePath {
    hardshareO: string;
    hardshareId: string;
}
export interface CodeRuntimeInfo extends HardsharePath, PreludeMapBase {
    readOnly: boolean;
    startShowIndex?: number;
    endShowIndex?: number;
    maxLine?: number;
    instance?: InstanceInfo;
}
export interface InstanceInfo {
    id?: string;
    status?: string;
    expiration?: number;
    token?: string;
    token64?: string;
    destpath?: string;
    command?: string;
    addons?: {
        cmdsh?: boolean;
        mistyproxy?: string;
    };
}
export interface InstanceParams {
    allow_noop: boolean;
    wds: string[];
    expire_d: string;
    repo?: {
        url: string;
        path?: string;
    };
    keepalive: boolean;
}
export {};
