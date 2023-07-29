import * as ace from 'ace-code';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';


interface InstanceInfo {
    id?: string;
    token?: string;
    token64?: string;
    destpath?: string;
    runCommand?: string;
}


function getApiToken(hardshareO: string, hardshareId: string)
{
    return new Promise((resolve, reject) => {
        let anon_id = localStorage.getItem('rr-api-token-anon-id');
        let anon_nonce = localStorage.getItem('rr-api-token-anon-nonce');
        let retryCounter = 0;

        const requestApiToken = () => {
            let options: RequestInit = {
                method: 'POST',
            };
            if (anon_id) {
                const formData = new FormData();
                formData.append('anon_id', anon_id);
                formData.append('nonce', anon_nonce);
                options.body = formData;
            }
            fetch(`https://rerobots.net/eapi/token/up/sandbox/${hardshareO}/${hardshareId}`, options).then((res) => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error(res.url);
            }).then((payload) => {
                const instanceInfo: InstanceInfo = {
                    token: payload.tok,
                    token64: payload.tok64,
                };
                if (payload.nonce && !anon_id) {
                    anon_id = payload.u.substring(payload.u.lastIndexOf('_')+1);
                    localStorage.setItem('rr-api-token-anon-id', anon_id);
                    localStorage.setItem('rr-api-token-anon-nonce', payload.nonce);
                }
                resolve(instanceInfo);
            }).catch((err) => {
                console.log(err);
                retryCounter++;
                if (retryCounter > 8) {
                    reject();
                }
                setTimeout(requestApiToken, 1000*(2**(retryCounter)));
            });
        };
        requestApiToken();
    });
}


function launchInstance(hardshareO: string, hardshareId: string, instanceInfo: InstanceInfo)
{
    return new Promise((resolve, reject) => {
        let retryCounter = 0;
        const requestSandboxInfo = () => {
            fetch(`https://rerobots.net/eapi/hardshare/${hardshareO}/${hardshareId}`, {
                method: 'GET',
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error(res.url);
            }).then((payload) => {
                const feasibleWdeployments = payload.wds;
                const expirationDuration = payload.expire_d.anon;
                instanceInfo.destpath = payload.destpath;
                instanceInfo.runCommand = payload.btn_command || 'echo "no run command set"';
                return fetch('https://api.rerobots.net/new', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + instanceInfo.token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        wds: feasibleWdeployments,
                        allow_noop: true,
                        expire_d: expirationDuration,
                    })
                });
            }).then((res) => {
                if (res.status === 503) {
                    reject();
                    return;
                }
                if (res.ok) {
                    return res.json();
                }
                throw new Error(res.url);
            }).then((payload) => {
                if (!payload) {
                    return;
                }
                instanceInfo.id = payload.id;
                resolve(instanceInfo);
            }).catch((err) => {
                console.log(err);
                retryCounter++;
                if (retryCounter > 8) {
                    reject();
                }
                setTimeout(requestSandboxInfo, 1000*(2**(retryCounter)));
            });
        };
        requestSandboxInfo();
    });
}


function prepareShell(instanceInfo: InstanceInfo)
{
    return new Promise((resolve, reject) => {
        let timer: any;
        let retryCounter = 0;
        const fetchAddonStatus = () => {
            fetch('https://api.rerobots.net/addon/cmdsh/' + instanceInfo.id, {
                headers: {
                    'Authorization': 'Bearer ' + instanceInfo.token,
                },
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else if (res.status === 404) {
                    return {status: 'notfound'};
                }
                throw new Error(res.url);
            }).then((data) => {
                if (data.status === 'notfound') {
                    fetch('https://api.rerobots.net/addon/cmdsh/' + instanceInfo.id, {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + instanceInfo.token,
                        },
                    });
                    retryCounter++;
                    if (retryCounter > 10) {
                        clearInterval(timer);
                        reject();
                    }
                } else if (data.status === 'active') {
                    clearInterval(timer);
                    resolve(instanceInfo);
                } else {
                    retryCounter++;
                    if (retryCounter > 10) {
                        clearInterval(timer);
                        reject();
                    }
                }
            });
        };
        timer = setInterval(fetchAddonStatus, 1000);
    });
}


export function runCode(hardshareO: string, hardshareId: string, root: HTMLElement, editor: ace.Ace.Editor, readOnly: boolean, runCommand: null | string, destpath: null | string, runButton: HTMLButtonElement, initRunButton: () => void, statusBar: HTMLSpanElement)
{
    const keyboardInterruptButton = document.createElement('button');
    keyboardInterruptButton.innerText = 'Interrupt';
    root.insertBefore(keyboardInterruptButton, statusBar);

    const clearTerminalButton = document.createElement('button');
    clearTerminalButton.innerText = 'Clear terminal';
    root.insertBefore(clearTerminalButton, statusBar);

    const teardownButton = document.createElement('button');
    teardownButton.innerText = 'Teardown sandbox';
    root.insertBefore(teardownButton, statusBar);

    statusBar.innerText = 'searching for available hardware...';

    const term = new Terminal();
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    let termDiv = document.createElement('div');
    root.appendChild(termDiv);
    termDiv.style.width = '500px';
    termDiv.style.height = '200px';

    term.open(termDiv);
    fitAddon.fit();

    let cameraImg = document.createElement('img');
    root.appendChild(cameraImg);

    clearTerminalButton.addEventListener('click', () => {
        term.reset();
    });

    let runButtonCallback: any = null;

    const cleanUp = () => {
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
    };
    teardownButton.addEventListener('click', cleanUp);

    const initPromise = getApiToken(hardshareO, hardshareId).then((instanceInfo: InstanceInfo) => {
        return launchInstance(hardshareO, hardshareId, instanceInfo);
    }).then((instanceInfo: InstanceInfo) => {
        teardownButton.addEventListener('click', () => {
            fetch('https://api.rerobots.net/terminate/' + instanceInfo.id, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + instanceInfo.token,
                    'Content-Type': 'application/json',
                }
            });
        });
        statusBar.innerText = 'hardware reserved; preparing sandbox...'
        return prepareShell(instanceInfo);
    }).then((instanceInfo: InstanceInfo) => {
        if (runCommand) {
            instanceInfo.runCommand = runCommand;
        }
        if (destpath) {
            instanceInfo.destpath = destpath;
        }
        const cmdshWs = new WebSocket(`wss://api.rerobots.net/addon/cmdsh/${instanceInfo.id}/new/${instanceInfo.token64}`);
        keyboardInterruptButton.addEventListener('click', () => {
            cmdshWs.send(String.fromCharCode(3));
        });
        const attachAddon = new AttachAddon(cmdshWs, {bidirectional: !readOnly});
        term.loadAddon(attachAddon);
        runButtonCallback = () => {
            fetch('https://api.rerobots.net/addon/cmdsh/' + instanceInfo.id + '/file', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + instanceInfo.token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    path: instanceInfo.destpath,
                    data: editor.getValue(),
                }),
            }).then((res) => {
                if (res.ok) {
                    cmdshWs.send('bash -c \'' + instanceInfo.runCommand + '\'\r');
                    return;
                }
                throw new Error(res.url);
            });
        };
        runButton.addEventListener('click', runButtonCallback);
        statusBar.innerText = '';

        const camWs = new WebSocket(`wss://api.rerobots.net/addon/cam/${instanceInfo.id}/0/feed/${instanceInfo.token64}`);
        camWs.addEventListener('message', function (event) {
            cameraImg.src = event.data;
        });

    }).then(() => {
        runButtonCallback();
    }).catch(() => {
        statusBar.innerText = 'none available; try again soon.';
        cleanUp();
    });
}
