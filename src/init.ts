import * as ace from 'ace-code';
import * as aceCppMode from 'ace-code/src/mode/c_cpp';
import * as acePythonMode from 'ace-code/src/mode/python';
import * as aceShMode from 'ace-code/src/mode/sh';

import './main.css';
import { runCode } from './sandbox';
import type { CodeRuntimeInfo } from './types';
import {
    getCodeRegion,
    initCodeRuntimeInfo,
    parsePrelude,
    parseRootData,
} from './util';

const highlightMap: { [key: string]: typeof aceCppMode } = {
    c_cpp: aceCppMode,
    python: acePythonMode,
    sh: aceShMode,
};

function showAllCode(coderi: CodeRuntimeInfo, editor: ace.Ace.Editor) {
    if (
        !coderi.lineRange ||
        !coderi.exampleCode ||
        !coderi.startShowIndex ||
        !coderi.endShowIndex
    ) {
        throw new Error('cannot show all code');
    }
    const originalRegion = coderi.exampleCode.substring(
        coderi.startShowIndex,
        coderi.endShowIndex,
    );
    const possiblyEditedRegion = editor.getValue();
    if (originalRegion === possiblyEditedRegion) {
        editor.setValue(coderi.exampleCode, -1);
    } else {
        const exampleCode =
            coderi.exampleCode.substring(0, coderi.startShowIndex) +
            possiblyEditedRegion +
            coderi.exampleCode.substring(coderi.endShowIndex);
        editor.setValue(exampleCode, -1);
    }
    editor.setOption('firstLineNumber', 1);
    if (coderi.maxLine) {
        editor.setOption('maxLines', coderi.maxLine);
    }
}

function hideSurroundingCode(coderi: CodeRuntimeInfo, editor: ace.Ace.Editor) {
    if (!coderi.lineRange || !coderi.exampleCode || !coderi.startShowIndex) {
        throw new Error('cannot hide surrounding code');
    }
    const region = editor.getValue()
        ? editor
              .getValue()
              .substring(coderi.startShowIndex, coderi.endShowIndex)
        : coderi.exampleCode.substring(
              coderi.startShowIndex,
              coderi.endShowIndex,
          );
    editor.setOption('firstLineNumber', coderi.lineRange[0]);
    editor.setValue(region, -1);
    editor.setOption('maxLines', coderi.lineRange[1] - coderi.lineRange[0] + 1);
}

// If codeRuntimeInfo is provided, then do not read values from given element.
export function prepareSnippet(
    root: HTMLDivElement | HTMLPreElement,
    codeRuntimeInfo?: CodeRuntimeInfo,
    syntaxHighlight?: string,
) {
    const coderi: CodeRuntimeInfo =
        codeRuntimeInfo || parseRootData(root) || initCodeRuntimeInfo();
    if (coderi.hardshareO === '') {
        const pm = parsePrelude(root.innerText);
        if (!pm.hardshare) {
            throw new Error('hardshare path not defined');
        }
        coderi.hardshareO = pm.hardshare.hardshareO;
        coderi.hardshareId = pm.hardshare.hardshareId;
        coderi.command = pm.command;
        coderi.destpath = pm.destpath;
        coderi.repoUrl = pm.repoUrl;
        coderi.repoScript = pm.repoScript;
        coderi.urlfile = pm.urlfile;
        coderi.exampleCode = pm.exampleCode;
        coderi.lineRange = pm.lineRange;
        coderi.refUrl = pm.refUrl;

        const exampleBlockElement = root.getElementsByTagName('code')[0];
        if (exampleBlockElement) {
            if (
                !syntaxHighlight &&
                exampleBlockElement.className.startsWith('language-')
            ) {
                syntaxHighlight = exampleBlockElement.className.substring(9);
            }
            root.removeChild(exampleBlockElement);
        }

        const newRoot = document.createElement('div');
        newRoot.className = root.className;
        root.replaceWith(newRoot);
        root = newRoot;
    }

    const editorDiv = document.createElement('div');
    editorDiv.className = 'docslabEditor';
    root.appendChild(editorDiv);

    if (coderi.runEnv === 'py' && !syntaxHighlight) {
        syntaxHighlight = 'python';
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

    const controlPanel = document.createElement('div');
    controlPanel.className = 'docslabPanel';

    const runButton = document.createElement('button');
    runButton.innerText = 'Run';
    runButton.classList.add('dl-runButton');
    controlPanel.appendChild(runButton);

    let resetShowingAllCode: (() => void) | null = null;

    const initialShowCode = () => {
        if (coderi.lineRange && coderi.exampleCode) {
            [coderi.startShowIndex, coderi.endShowIndex, coderi.maxLine] =
                getCodeRegion(coderi.exampleCode, coderi.lineRange, '\n');
            if (coderi.lineRange[1] === -1) {
                coderi.lineRange[1] = coderi.maxLine;
            }
            hideSurroundingCode(coderi, editor);

            const showAllButton: HTMLButtonElement =
                document.createElement('button');
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
            resetShowingAllCode = () => {
                if (showingAllCode) {
                    showingAllCode = false;
                    showAllButton.innerText = 'Show all';
                }
            };
        } else {
            editor.setValue(coderi.exampleCode || '', -1);
        }
    };

    if (coderi.urlfile) {
        fetch(coderi.urlfile)
            .then((res) => {
                if (res.ok) {
                    return res.text();
                }
                throw new Error(res.url);
            })
            .then((text) => {
                coderi.exampleCode = text;
                initialShowCode();
            })
            .catch((err) => {
                console.log(err);
            });
    } else if (coderi.exampleCode) {
        initialShowCode();
    }

    if (coderi.readOnly) {
        editor.setReadOnly(true);
    }

    let resetButton: HTMLButtonElement;
    if (!coderi.readOnly) {
        resetButton = document.createElement('button');
        resetButton.innerText = 'Reset code';
        resetButton.classList.add('dl-resetButton');
        controlPanel.appendChild(resetButton);
        resetButton.addEventListener('click', () => {
            coderi.exampleCode ||= '';
            editor.setValue(coderi.exampleCode, -1);
            if (resetShowingAllCode) {
                resetShowingAllCode();
                hideSurroundingCode(coderi, editor);
            }
        });
    }

    const statusBar = document.createElement('span');
    statusBar.className = 'docslabStatus';
    controlPanel.appendChild(statusBar);

    const moreInfoSection = document.createElement('div');
    moreInfoSection.className = 'docslabMoreInfo';

    if (coderi.refUrl || coderi.repoUrl) {
        const refUrl = coderi.refUrl || (coderi.repoUrl as string);
        const repoUrlLink: HTMLAnchorElement = document.createElement('a');
        repoUrlLink.href = refUrl;
        repoUrlLink.target = '_blank';
        repoUrlLink.innerText = 'go to repository';
        repoUrlLink.className = 'docslabRepo';
        moreInfoSection.appendChild(repoUrlLink);
    }

    const poweredBy = document.createElement('span');
    poweredBy.innerHTML =
        'powered by <a href="https://github.com/rerobots/docslab" target="_blank">docslab</a>';
    poweredBy.className = 'docslabPowered';
    moreInfoSection.appendChild(poweredBy);
    controlPanel.appendChild(moreInfoSection);

    root.appendChild(controlPanel);

    let terminationTimeout: NodeJS.Timeout | null = null;
    const assignTerminationTimeout = (x: NodeJS.Timeout | null) => {
        terminationTimeout = x;
    };
    const initRunButton = () => {
        const runButtonCallback = async () => {
            if (terminationTimeout !== null) {
                clearTimeout(terminationTimeout);
            }
            runButton.removeEventListener('click', runButtonCallback);
            await runCode(
                coderi,
                controlPanel,
                editor,
                runButton,
                initRunButton,
                statusBar,
                assignTerminationTimeout,
            );
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

export function loadAll() {
    const codeBlocks = document.getElementsByClassName('docslab');
    for (let j = 0; j < codeBlocks.length; j++) {
        prepareSnippet(codeBlocks[j] as HTMLDivElement | HTMLPreElement);
    }
}
