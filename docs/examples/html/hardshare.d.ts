import type { CodeRuntimeInfo, InstanceInfo } from './types';
interface CancelFlag {
    cancelled: boolean;
}
export declare function getApiToken(hardshareO: string, hardshareId: string, cancelFlag?: CancelFlag): Promise<string[]>;
export declare function launchInstance(coderi: CodeRuntimeInfo, cancelFlag?: CancelFlag): Promise<CodeRuntimeInfo>;
export declare function prepareShell(coderi: CodeRuntimeInfo, cancelFlag?: CancelFlag): Promise<CodeRuntimeInfo>;
export declare function createMistyProxy(coderi: CodeRuntimeInfo, cancelFlag?: CancelFlag): Promise<CodeRuntimeInfo>;
export declare function getInstanceInfo(coderi: CodeRuntimeInfo, cancelFlag?: CancelFlag): Promise<InstanceInfo>;
export declare function attachCameraStream(coderi: CodeRuntimeInfo, root: HTMLElement, el: HTMLImageElement, width?: number, height?: number): Promise<void>;
export declare function terminateInstance(coderi: CodeRuntimeInfo): Promise<void>;
export {};
