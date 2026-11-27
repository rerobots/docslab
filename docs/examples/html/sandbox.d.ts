/// <reference types="node" />
import type { EditorView } from '@codemirror/view';
import '@xterm/xterm/css/xterm.css';
import type { CodeRuntimeInfo } from './types';
export declare function runCode(coderi: CodeRuntimeInfo, controlPanel: HTMLElement, editor: EditorView, runButton: HTMLButtonElement, initRunButton: () => void, statusBar: HTMLSpanElement, assignTerminationTimeout: (x: NodeJS.Timeout | null) => void): Promise<void>;
