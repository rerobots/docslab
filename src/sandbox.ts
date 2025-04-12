import * as ace from 'ace-code';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';

import { getApiToken, launchInstance, prepareShell } from './hardshare';
import type { CodeRuntimeInfo, InstanceInfo } from './types';

export function runCode(
    coderi: CodeRuntimeInfo,
    controlPanel: HTMLElement,
    editor: ace.Ace.Editor,
    runButton: HTMLButtonElement,
    initRunButton: () => void,
    statusBar: HTMLSpanElement,
    assignTerminationTimeout: (x: NodeJS.Timeout | null) => void,
) {
    const keyboardInterruptButton = document.createElement('button');
    keyboardInterruptButton.innerText = 'Interrupt';
    keyboardInterruptButton.classList.add('dl-interruptButton');
    controlPanel.insertBefore(keyboardInterruptButton, statusBar);

    const clearTerminalButton = document.createElement('button');
    clearTerminalButton.innerText = 'Clear terminal';
    clearTerminalButton.classList.add('dl-clearTerminalButton');
    controlPanel.insertBefore(clearTerminalButton, statusBar);

    const teardownButton = document.createElement('button');
    teardownButton.innerText = 'Teardown sandbox';
    teardownButton.classList.add('dl-teardownButton');
    controlPanel.insertBefore(teardownButton, statusBar);

    statusBar.innerText = 'Searching for available hardware...';

    const term = new Terminal();
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    const termDiv = document.createElement('div');
    termDiv.classList.add('dl-terminalContainer');

    const root = controlPanel.parentElement as HTMLElement;
    root.appendChild(termDiv);

    term.open(termDiv);
    fitAddon.fit();

    const cameraImg = document.createElement('img');
    cameraImg.classList.add('dl-cameraImg');

    clearTerminalButton.addEventListener('click', () => {
        term.reset();
    });

    let runButtonCallback: (() => void) | null = null;

    const cancelFlag = {
        cancelled: false,
    };
    const cleanUp = () => {
        cancelFlag.cancelled = true;
        if (runButtonCallback) {
            runButton.removeEventListener('click', runButtonCallback);
        }
        term.dispose();
        termDiv.remove();
        teardownButton.remove();
        keyboardInterruptButton.remove();
        clearTerminalButton.remove();
        cameraImg.remove();
        initRunButton();
        statusBar.innerText = '';
    };
    teardownButton.addEventListener('click', cleanUp);

    getApiToken(coderi.hardshareO, coderi.hardshareId, cancelFlag)
        .then((instanceInfo: InstanceInfo) => {
            return launchInstance(coderi, instanceInfo, cancelFlag);
        })
        .then((instanceInfo: InstanceInfo) => {
            const instanceStatusWatcherFn = (
                instanceStatusWatcher: NodeJS.Timeout,
            ) => {
                if (teardownButton.parentElement === null) {
                    clearInterval(instanceStatusWatcher);
                    return;
                }
                fetch('https://api.rerobots.net/instance/' + instanceInfo.id, {
                    headers: {
                        Authorization: 'Bearer ' + instanceInfo.token,
                        'Content-Type': 'application/json',
                    },
                })
                    .then((res) => {
                        if (res.ok) {
                            return res.json();
                        }
                        throw new Error(res.url);
                    })
                    .then((payload) => {
                        if (teardownButton.parentElement === null) {
                            clearInterval(instanceStatusWatcher);
                            return;
                        }

                        if (
                            payload.status === 'READY' &&
                            instanceInfo.status === 'INIT'
                        ) {
                            clearInterval(instanceStatusWatcher);
                            const instanceStatusWatcherSlow = setInterval(
                                () => {
                                    instanceStatusWatcherFn(
                                        instanceStatusWatcherSlow,
                                    );
                                },
                                10000,
                            );

                            fetch(
                                'https://api.rerobots.net/addon/cam/' +
                                    instanceInfo.id,
                                {
                                    method: 'GET',
                                    headers: {
                                        Authorization:
                                            'Bearer ' + instanceInfo.token,
                                        'Content-Type': 'application/json',
                                    },
                                },
                            )
                                .then((res) => {
                                    if (res.ok) {
                                        return res.json();
                                    }
                                    if (res.status === 404) {
                                        return;
                                    }
                                    throw new Error(res.url);
                                })
                                .then((payload) => {
                                    if (payload.status === 'active') {
                                        root.appendChild(cameraImg);
                                        const camWs = new WebSocket(
                                            `wss://api.rerobots.net/addon/cam/${instanceInfo.id}/0/feed/${instanceInfo.token64}`,
                                        );
                                        camWs.addEventListener(
                                            'message',
                                            function (event) {
                                                cameraImg.src = event.data;
                                            },
                                        );
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        }
                        instanceInfo.status = payload.status;

                        if (!instanceInfo.expiration) {
                            instanceInfo.expiration = new Date(
                                payload.expires + 'Z',
                            ).valueOf();
                        }
                        if (
                            payload.status !== 'INIT' &&
                            payload.status !== 'READY'
                        ) {
                            statusBar.innerText = 'Instance terminated.';
                            if (runButtonCallback) {
                                runButton.removeEventListener(
                                    'click',
                                    runButtonCallback,
                                );
                                runButtonCallback = null;
                            }
                            clearInterval(instanceStatusWatcher);
                        } else if (
                            (instanceInfo.expiration - Date.now()) / 1000.0 <=
                            60
                        ) {
                            statusBar.innerText =
                                'Less than 60 seconds of access remaining';
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        clearInterval(instanceStatusWatcher);
                    });
            };
            const instanceStatusWatcher = setInterval(() => {
                instanceStatusWatcherFn(instanceStatusWatcher);
            }, 1000);

            teardownButton.addEventListener('click', () => {
                const timeout = setTimeout(() => {
                    assignTerminationTimeout(null);
                    fetch(
                        'https://api.rerobots.net/terminate/' + instanceInfo.id,
                        {
                            method: 'POST',
                            headers: {
                                Authorization: 'Bearer ' + instanceInfo.token,
                                'Content-Type': 'application/json',
                            },
                        },
                    );
                }, 3000);
                assignTerminationTimeout(timeout);
            });
            statusBar.innerText = 'Hardware reserved; preparing sandbox...';
            return prepareShell(instanceInfo, cancelFlag);
        })
        .then((instanceInfo: InstanceInfo) => {
            if (coderi.command) {
                instanceInfo.command = coderi.command;
            }
            if (coderi.destpath) {
                instanceInfo.destpath = coderi.destpath;
            }
            const cmdshWs = new WebSocket(
                `wss://api.rerobots.net/addon/cmdsh/${instanceInfo.id}/new/${instanceInfo.token64}`,
            );
            keyboardInterruptButton.addEventListener('click', () => {
                cmdshWs.send(String.fromCharCode(3));
            });
            const attachAddon = new AttachAddon(cmdshWs, {
                bidirectional: !coderi.readOnly,
            });
            term.loadAddon(attachAddon);
            runButtonCallback = () => {
                fetch(
                    'https://api.rerobots.net/addon/cmdsh/' +
                        instanceInfo.id +
                        '/file',
                    {
                        method: 'POST',
                        headers: {
                            Authorization: 'Bearer ' + instanceInfo.token,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            path: instanceInfo.destpath,
                            data: editor.getValue(),
                        }),
                    },
                ).then((res) => {
                    if (res.ok) {
                        cmdshWs.send(String.fromCharCode(3));
                        cmdshWs.send(
                            "bash -c '" + instanceInfo.command + "'\r",
                        );
                        return;
                    }
                    throw new Error(res.url);
                });
            };

            cmdshWs.addEventListener('open', () => {
                if (runButtonCallback) {
                    runButtonCallback();
                }
            });

            runButton.addEventListener('click', runButtonCallback);
            statusBar.innerText = '';
        })
        .catch(() => {
            if (!cancelFlag.cancelled) {
                cleanUp();
                statusBar.innerText = 'None available; try again soon.';
            }
            // If cancelFlag.cancelled true, then cleanUp() was already called
        });
}
