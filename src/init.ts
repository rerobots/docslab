import * as ace from 'ace-code';
import * as aceCppMode from 'ace-code/src/mode/c_cpp';
import * as acePythonMode from 'ace-code/src/mode/python';
import * as aceShMode from 'ace-code/src/mode/sh';

import { runCode } from './sandbox';
import type {
    CodeRuntimeInfo,
    HardsharePath,
    PreludeKey,
    PreludeMap,
} from './types';


const highlightMap: {[key: string]: typeof aceCppMode} = {
    c_cpp: aceCppMode,
    python: acePythonMode,
    sh: aceShMode,
};


export function parsePrelude(codeBlob: string): PreludeMap
{
    const knownKeys: PreludeKey[] = [
        'command',
        'destpath',
        'repoUrl',
        'repoScript',
        'urlfile',
    ];
    const pm: PreludeMap = {};

    let start = 0;
    let end = codeBlob.indexOf('\n');
    while (end > 0) {
        let line = codeBlob.substring(start, end).trim();
        const previous = start;
        start = end + 1;
        end = codeBlob.indexOf('\n', start);

        if (line.startsWith('#')) {
            line = line.replace(/#+/, '');
        } if (line.startsWith(';')) {
            line = line.replace(/;+/, '');
        } else if (line.startsWith('/*')) {
            const matchingEnd = line.endsWith('*/');
            line = line.replace(/\/\*+/, '');
            if (matchingEnd && !line.endsWith('*/')) {
                // Special case for long comment lines of the form /*******/
                line = line.substring(1);
            }
        } else if (line.startsWith('/')) {
            line = line.replace(/\/+/, '');
        }
        if (line.endsWith('*/')) {
            line = line.substring(0, line.length - 2);
        }
        line = line.trim();
        if (line.length === 0) {
            continue;
        }
        const sep = line.indexOf(':');
        if (sep < 1) {
            if (!line.startsWith('---')) {
                start = previous;
            }
            break;
        }
        const key = line.substring(0, sep).trim();
        if (!knownKeys.includes(key as PreludeKey)) {
            break;
        }
        pm[key as PreludeKey] = line.substring(sep + 1).trim();
    }
    if (end > 0) {
        pm.exampleCode = codeBlob.substring(start);
    }

    return pm;
}


function parseRootData(root: HTMLDivElement): CodeRuntimeInfo
{
    const coderi: CodeRuntimeInfo = {
        readOnly: ('readonly' in root.dataset) || false,
        hardshareO: root.dataset['hardshareo'],
        hardshareId: root.dataset['hardshareid'],
    };
    const exampleBlockElement = document.getElementById(`cb-${coderi.hardshareId}`);
    if (exampleBlockElement) {
        coderi.exampleCode = exampleBlockElement.innerText;
        root.removeChild(exampleBlockElement.parentElement);
    }
    if ('command' in root.dataset) {
        coderi.command = root.dataset['command'];
    }
    if ('path' in root.dataset) {
        coderi.destpath = root.dataset['path'];
    }
    if ('repo' in root.dataset) {
        coderi.repoUrl = root.dataset['repo'];
    }
    if ('iscript' in root.dataset) {
        coderi.repoScript = root.dataset['iscript'];
    }
    if ('urlfile' in root.dataset) {
        coderi.urlfile = root.dataset['urlfile'];
    }
    return coderi;
}


export function parseHardsharePath(hspath: string): HardsharePath
{
    const sep = hspath.indexOf('/');
    if (sep < 1 || sep >= hspath.length - 1) {
        throw new Error(`separator '/' not found in '${hspath}'`);
    }

    return {
        hardshareO: hspath.substring(0, sep),
        hardshareId: hspath.substring(sep + 1),
    };
}


// If codeRuntimeInfo is provided, then do not read values from given element.
export function prepareSnippet(root: HTMLDivElement, codeRuntimeInfo?: CodeRuntimeInfo, syntaxHighlight?: string)
{
    const coderi: CodeRuntimeInfo = codeRuntimeInfo || parseRootData(root);

    const editorDiv = document.createElement('div');
    root.appendChild(editorDiv);
    editorDiv.style.width = '500px';
    editorDiv.style.height = '200px';

    const editor = ace.edit(editorDiv);
    if (syntaxHighlight) {
        if (syntaxHighlight === 'c' || syntaxHighlight === 'cpp') {
            syntaxHighlight = 'c_cpp';
        } else if (syntaxHighlight === 'bash') {
            syntaxHighlight = 'sh';
        }
        if (!Object.keys(highlightMap).includes(syntaxHighlight)) {
            console.log('Unknown syntax highlighting mode:', syntaxHighlight);
        } else {
            editor.session.setMode(new highlightMap[syntaxHighlight].Mode());
        }
    }
    if (coderi.urlfile) {
        fetch(coderi.urlfile).then((res) => {
            if (res.ok) {
                return res.text();
            }
            throw new Error(res.url);
        }).then((text) => {
            coderi.exampleCode = text;
            editor.setValue(text, -1);
        }).catch((err) => {
            console.log(err);
            if (coderi.exampleCode) {
                editor.setValue(coderi.exampleCode, -1);
            }
        });
    } else if (coderi.exampleCode) {
        editor.setValue(coderi.exampleCode, -1);
    }

    if (coderi.readOnly) {
        editor.setReadOnly(true);
    }

    const runButton = document.createElement('button');
    runButton.innerText = 'Run';
    root.appendChild(runButton);

    let resetButton;
    if (!coderi.readOnly) {
        resetButton = document.createElement('button');
        resetButton.innerText = 'Reset code';
        root.appendChild(resetButton);
        resetButton.addEventListener('click', () => {
            editor.setValue(coderi.exampleCode, -1);
        });
    }

    const statusBar = document.createElement('span');
    root.appendChild(statusBar);

    let terminationTimeout: NodeJS.Timeout | null = null;
    const assignTerminationTimeout = (x: NodeJS.Timeout) => {
        terminationTimeout = x;
    };
    const initRunButton = () => {
        const runButtonCallback = () => {
            if (terminationTimeout !== null) {
                clearTimeout(terminationTimeout);
            }
            runButton.removeEventListener('click', runButtonCallback);
            runCode(coderi, root, editor, runButton, initRunButton, statusBar, assignTerminationTimeout);
        };
        runButton.addEventListener('click', runButtonCallback);
    };
    initRunButton();

    for (let k = 0; k < root.children.length; k++) {
        if (root.children[k].tagName.toUpperCase() === 'A') {
            root.removeChild(root.children[k]);
            break;
        }
    }
}


export function loadAll()
{
    const codeBlocks = document.getElementsByClassName("docslab");
    for (let j = 0; j < codeBlocks.length; j++) {
        prepareSnippet(codeBlocks[j] as HTMLDivElement);
    }
}
