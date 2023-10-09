import * as ace from 'ace-code';
import * as aceCppMode from 'ace-code/src/mode/c_cpp';
import * as acePythonMode from 'ace-code/src/mode/python';
import * as aceShMode from 'ace-code/src/mode/sh';

import { runCode } from './sandbox';
import { getCodeRegion } from './util';
import type {
    CodeRuntimeInfo,
    HardsharePath,
} from './types';


const highlightMap: {[key: string]: typeof aceCppMode} = {
    c_cpp: aceCppMode,
    python: acePythonMode,
    sh: aceShMode,
};


function parseRootData(root: HTMLDivElement): CodeRuntimeInfo
{
    if (!('hardshareo' in root.dataset)) {
        throw new Error('hardshareo not defined');
    }
    if (!('hardshareid' in root.dataset)) {
        throw new Error('hardshareid not defined');
    }
    const coderi: CodeRuntimeInfo = {
        readOnly: ('readonly' in root.dataset) || false,
        hardshareO: root.dataset['hardshareo'] as string,
        hardshareId: root.dataset['hardshareid'] as string,
    };
    const exampleBlockElement = document.getElementById(`cb-${coderi.hardshareId}`);
    if (exampleBlockElement) {
        coderi.exampleCode = exampleBlockElement.innerText;
        root.removeChild(exampleBlockElement.parentElement as Node);
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
    if ('lrange' in root.dataset && root.dataset['lrange']) {
        const parts = root.dataset['lrange'].split(',').map((x) => (
            x.trim()
        ));
        if (parts.length !== 2) {
            throw new Error('unexpected number of parameters in lrange');
        }
        coderi.lineRange = [Number(parts[0]), Number(parts[1])];
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
    editorDiv.className = 'docslabEditor';
    root.appendChild(editorDiv);

    // If scroll height is too small, infer need to apply minimum size style
    if (editorDiv.scrollHeight < 10) {
        editorDiv.style.width = '500px';
        editorDiv.style.height = '200px';
    }

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
        }).catch((err) => {
            console.log(err);
        });
    }

    if (coderi.readOnly) {
        editor.setReadOnly(true);
    }
    if (coderi.exampleCode) {
        if (coderi.lineRange) {
            const [startShowIndex, endShowIndex, maxLine] = getCodeRegion(coderi.exampleCode, coderi.lineRange, '\n');
            [coderi.startShowIndex, coderi.endShowIndex] = [startShowIndex, endShowIndex];
            if (coderi.lineRange[1] === -1) {
                coderi.lineRange[1] = maxLine;
            }
            editor.setOption('firstLineNumber', coderi.lineRange[0]);
            editor.setValue(coderi.exampleCode.substring(coderi.startShowIndex, coderi.endShowIndex), -1);
            editor.setOption('maxLines', coderi.lineRange[1] - coderi.lineRange[0] + 1);
        } else {
            editor.setValue(coderi.exampleCode, -1);
        }
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
            coderi.exampleCode ||= '';
            if (coderi.startShowIndex) {
                editor.setValue(coderi.exampleCode.substring(coderi.startShowIndex, coderi.endShowIndex), -1);
            } else {
                editor.setValue(coderi.exampleCode, -1);
            }
        });
    }

    const statusBar = document.createElement('span');
    root.appendChild(statusBar);

    let terminationTimeout: NodeJS.Timeout | null = null;
    const assignTerminationTimeout = (x: NodeJS.Timeout | null) => {
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
