import { runCode } from './sandbox';

import * as ace from 'ace-code';


export interface CodeRuntimeInfo {
    hardshareO: string,
    hardshareId: string,
    runCommand?: string,
    destpath?: string,
    exampleCode?: string,
    repoUrl?: string,
    repoScript?: string,
    urlfile?: string,
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


// If codeRuntimeInfo is provided, then do not read values from given element.
export function prepareSnippet(root: HTMLDivElement, codeRuntimeInfo?: CodeRuntimeInfo)
{
    const coderi: CodeRuntimeInfo = codeRuntimeInfo || parseRootData(root);

    const editorDiv = document.createElement('div');
    root.appendChild(editorDiv);
    editorDiv.style.width = '500px';
    editorDiv.style.height = '200px';

    const editor = ace.edit(editorDiv);
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
