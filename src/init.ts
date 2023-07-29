import { runCode } from './sandbox';

import * as ace from 'ace-code';


export function prepareSnippet(root: HTMLElement)
{
    const readOnly = ('readonly' in root.dataset) || false;
    const hardshareO = root.dataset['hardshareo'];
    const hardshareId = root.dataset['hardshareid'];
    const runCommand = root.dataset['command'] || null;
    const destpath = root.dataset['path'] || null;
    const exampleBlockElement = document.getElementById(`cb-${hardshareId}`);
    const exampleBlock = exampleBlockElement.innerText;

    const editorDiv = document.createElement('div');
    root.appendChild(editorDiv);
    root.removeChild(exampleBlockElement.parentElement);
    editorDiv.style.width = '500px';
    editorDiv.style.height = '200px';

    const editor = ace.edit(editorDiv);
    editor.setValue(exampleBlock, -1);
    if (readOnly) {
        editor.setReadOnly(true);
    }

    const runButton = document.createElement('button');
    runButton.innerText = 'Run';
    root.appendChild(runButton);

    let resetButton;
    if (!readOnly) {
        resetButton = document.createElement('button');
        resetButton.innerText = 'Reset code';
        root.appendChild(resetButton);
        resetButton.addEventListener('click', () => {
            editor.setValue(exampleBlock, -1);
        });
    }

    const statusBar = document.createElement('span');
    root.appendChild(statusBar);

    const initRunButton = () => {
        const runButtonCallback = () => {
            runButton.removeEventListener('click', runButtonCallback);
            runCode(hardshareO, hardshareId, root, editor, readOnly, runCommand, destpath, runButton, initRunButton, statusBar);
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
        prepareSnippet(codeBlocks[j] as HTMLElement);
    }
}
