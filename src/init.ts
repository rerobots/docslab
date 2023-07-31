import { runCode } from './sandbox';

import * as ace from 'ace-code';


export interface CodeRuntimeInfo {
    hardshareO: string,
    hardshareId: string,
    runCommand?: string,
    destpath?: string,
    exampleCode?: string,
    readOnly: boolean,
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
        coderi.runCommand = root.dataset['command'];
    }
    if ('path' in root.dataset) {
        coderi.destpath = root.dataset['path'];
    }
    return coderi;
}


// If codeRuntimeInfo is provided, then do not read values from given element.
export function prepareSnippet(root: HTMLDivElement, codeRuntimeInfo?: CodeRuntimeInfo)
{
    const coderi: CodeRuntimeInfo = codeRuntimeInfo || parseRootData(root);

    const editorDiv = document.createElement('div');
    root.appendChild(editorDiv);
    editorDiv.style.width = '500px';
    editorDiv.style.height = '200px';

    const editor = ace.edit(editorDiv);
    editor.setValue(coderi.exampleCode, -1);
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
