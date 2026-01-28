/// <reference types="node" />
import type * as ace from 'ace-code';
import '@xterm/xterm/css/xterm.css';
import type { CodeRuntimeInfo } from './types';
export declare function runCode(coderi: CodeRuntimeInfo, controlPanel: HTMLElement, editor: ace.Ace.Editor, runButton: HTMLButtonElement, initRunButton: () => void, statusBar: HTMLSpanElement, assignTerminationTimeout: (x: NodeJS.Timeout | null) => void): Promise<void>;
