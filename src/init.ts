import * as ace from 'ace-code';
import * as aceCppMode from 'ace-code/src/mode/c_cpp';
import * as acePythonMode from 'ace-code/src/mode/python';
import * as aceShMode from 'ace-code/src/mode/sh';

import './main.css';
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


function showAllCode(coderi: CodeRuntimeInfo, editor: ace.Ace.Editor)
{
    if (!coderi.lineRange || !coderi.exampleCode) {
        throw new Error('cannot show all code');
    }
    editor.setValue(coderi.exampleCode, -1);
    editor.setOption('firstLineNumber', 1);
    if (coderi.maxLine) {
        editor.setOption('maxLines', coderi.maxLine);
    }
}

function hideSurroundingCode(coderi: CodeRuntimeInfo, editor: ace.Ace.Editor)
{
    if (!coderi.lineRange || !coderi.exampleCode || !coderi.startShowIndex) {
        throw new Error('cannot hide surrounding code');
    }
    editor.setOption('firstLineNumber', coderi.lineRange[0]);
    editor.setValue(coderi.exampleCode.substring(coderi.startShowIndex, coderi.endShowIndex), -1);
    editor.setOption('maxLines', coderi.lineRange[1] - coderi.lineRange[0] + 1);
}


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

    const controlPanel = document.createElement('div');
    controlPanel.className = 'docslabPanel';

    const runButton = document.createElement('button');
    runButton.innerText = 'Run';
    controlPanel.appendChild(runButton);

    const initialShowCode = () => {
        if (coderi.lineRange && coderi.exampleCode) {
            [coderi.startShowIndex, coderi.endShowIndex, coderi.maxLine] = getCodeRegion(coderi.exampleCode, coderi.lineRange, '\n');
            if (coderi.lineRange[1] === -1) {
                coderi.lineRange[1] = coderi.maxLine;
            }
            hideSurroundingCode(coderi, editor);

            const showAllButton: HTMLButtonElement = document.createElement('button');
            showAllButton.innerText = 'Show all';
            controlPanel.appendChild(showAllButton);
            let showingAllCode = false;
            showAllButton.addEventListener('click', () => {
                if (showingAllCode) {
                    showingAllCode = false;
                    hideSurroundingCode(coderi, editor);
                    showAllButton.innerText = 'Show all';
                } else {
                    showingAllCode = true;
                    showAllCode(coderi, editor);
                    showAllButton.innerText = 'Hide surrounding code';
                }
            });

        } else {
            editor.setValue(coderi.exampleCode || '', -1);
        }
    };

    if (coderi.urlfile) {
        fetch(coderi.urlfile).then((res) => {
            if (res.ok) {
                return res.text();
            }
            throw new Error(res.url);
        }).then((text) => {
            coderi.exampleCode = text;
            initialShowCode();
        }).catch((err) => {
            console.log(err);
        });
    } else if (coderi.exampleCode) {
        initialShowCode();
    }

    if (coderi.readOnly) {
        editor.setReadOnly(true);
    }

    let resetButton;
    if (!coderi.readOnly) {
        resetButton = document.createElement('button');
        resetButton.innerText = 'Reset code';
        controlPanel.appendChild(resetButton);
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
    statusBar.className = 'docslabStatus';
    controlPanel.appendChild(statusBar);

    const poweredBy = document.createElement('span');
    poweredBy.innerHTML = 'powered by <a href="https://github.com/rerobots/docslab" target="_blank">docslab</a>';
    poweredBy.className = 'docslabPowered';
    controlPanel.appendChild(poweredBy);

    root.appendChild(controlPanel);

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
            runCode(coderi, controlPanel, editor, runButton, initRunButton, statusBar, assignTerminationTimeout);
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
