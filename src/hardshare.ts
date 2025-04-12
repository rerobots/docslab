import { instanceKeepAlive } from 'rerobots';
import type { CodeRuntimeInfo, InstanceInfo, InstanceParams } from './types';

interface CancelFlag {
    cancelled: boolean;
}

function checkIfCancelled(cancelFlag?: CancelFlag, reject?: () => void) {
    if (cancelFlag && cancelFlag.cancelled) {
        if (reject) {
            reject();
        } else {
            throw 'cancel';
        }
    }
}

export function getApiToken(
    hardshareO: string,
    hardshareId: string,
    cancelFlag?: CancelFlag,
): Promise<InstanceInfo> {
    return new Promise((resolve, reject) => {
        let anon_id: null | string = localStorage.getItem(
            'rr-api-token-anon-id',
        );
        let retryCounter = 0;

        const requestApiToken = () => {
            const options: RequestInit = {
                method: 'POST',
            };
            if (anon_id) {
                const anon_nonce =
                    localStorage.getItem('rr-api-token-anon-nonce') || '';
                const formData = new FormData();
                formData.append('anon_id', anon_id);
                formData.append('nonce', anon_nonce);
                options.body = formData;
            }
            checkIfCancelled(cancelFlag, reject);
            fetch(
                `https://rerobots.net/eapi/token/up/sandbox/${hardshareO}/${hardshareId}`,
                options,
            )
                .then((res) => {
                    checkIfCancelled(cancelFlag);
                    if (res.ok) {
                        return res.json();
                    }
                    if (res.status === 403) {
                        anon_id = null;
                    }
                    throw new Error(res.url);
                })
                .then((payload) => {
                    const instanceInfo: InstanceInfo = {
                        token: payload.tok,
                        token64: payload.tok64,
                    };
                    if (payload.nonce && !anon_id) {
                        anon_id = payload.u.substring(
                            payload.u.lastIndexOf('_') + 1,
                        ) as string;
                        localStorage.setItem('rr-api-token-anon-id', anon_id);
                        localStorage.setItem(
                            'rr-api-token-anon-nonce',
                            payload.nonce,
                        );
                    }
                    resolve(instanceInfo);
                })
                .catch((err) => {
                    if (err === 'cancel') {
                        reject();
                        return;
                    }
                    console.log(err);
                    retryCounter++;
                    if (retryCounter > 8) {
                        reject();
                        return;
                    }
                    setTimeout(requestApiToken, 1000 * 2 ** retryCounter);
                });
        };
        requestApiToken();
    });
}

export function launchInstance(
    coderi: CodeRuntimeInfo,
    instanceInfo: InstanceInfo,
    cancelFlag?: CancelFlag,
): Promise<InstanceInfo> {
    return new Promise((resolve, reject) => {
        let retryCounter = 0;
        const requestSandboxInfo = () => {
            checkIfCancelled(cancelFlag, reject);
            fetch(
                `https://rerobots.net/eapi/hardshare/${coderi.hardshareO}/${coderi.hardshareId}`,
                {
                    method: 'GET',
                },
            )
                .then((res) => {
                    checkIfCancelled(cancelFlag);
                    if (res.ok) {
                        return res.json();
                    }
                    throw new Error(res.url);
                })
                .then((payload) => {
                    const newInstanceParams: InstanceParams = {
                        allow_noop: true,
                        wds: payload.wds,
                        expire_d: payload.expire_d.anon,
                        keepalive: true,
                    };
                    if (coderi.repoUrl) {
                        newInstanceParams.repo = {
                            url: coderi.repoUrl,
                        };
                        if (coderi.repoScript) {
                            newInstanceParams.repo.path = coderi.repoScript;
                        }
                    }
                    instanceInfo.destpath = payload.destpath;
                    instanceInfo.command =
                        payload.btn_command || 'echo "no run command set"';
                    checkIfCancelled(cancelFlag);
                    return fetch('https://api.rerobots.net/new', {
                        method: 'POST',
                        headers: {
                            Authorization: 'Bearer ' + instanceInfo.token,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newInstanceParams),
                    });
                })
                .then((res) => {
                    checkIfCancelled(cancelFlag);
                    if (res.status === 503) {
                        reject();
                        return;
                    }
                    if (res.ok) {
                        return res.json();
                    }
                    throw new Error(res.url);
                })
                .then((payload) => {
                    if (!payload) {
                        return;
                    }
                    instanceKeepAlive(payload.id, instanceInfo.token as string);
                    instanceInfo.id = payload.id;
                    instanceInfo.status = 'INIT';
                    resolve(instanceInfo);
                })
                .catch((err) => {
                    if (err === 'cancel') {
                        reject();
                        return;
                    }
                    console.log(err);
                    retryCounter++;
                    if (retryCounter > 8) {
                        reject();
                        return;
                    }
                    setTimeout(requestSandboxInfo, 1000 * 2 ** retryCounter);
                });
        };
        requestSandboxInfo();
    });
}

export function prepareShell(
    instanceInfo: InstanceInfo,
    cancelFlag?: CancelFlag,
): Promise<InstanceInfo> {
    return new Promise((resolve, reject) => {
        let retryCounter = 0;
        const timer = setInterval(() => {
            checkIfCancelled(cancelFlag, () => {
                clearInterval(timer);
                reject();
            });
            fetch('https://api.rerobots.net/addon/cmdsh/' + instanceInfo.id, {
                headers: {
                    Authorization: 'Bearer ' + instanceInfo.token,
                },
            })
                .then((res) => {
                    checkIfCancelled(cancelFlag);
                    if (res.ok) {
                        return res.json();
                    } else if (res.status === 404) {
                        return { status: 'notfound' };
                    }
                    throw new Error(res.url);
                })
                .then((data) => {
                    if (data.status === 'notfound') {
                        checkIfCancelled(cancelFlag);
                        fetch(
                            'https://api.rerobots.net/addon/cmdsh/' +
                                instanceInfo.id,
                            {
                                method: 'POST',
                                headers: {
                                    Authorization:
                                        'Bearer ' + instanceInfo.token,
                                },
                            },
                        );
                        retryCounter++;
                        if (retryCounter > 30) {
                            clearInterval(timer);
                            console.log('timeout: command shell did not start');
                            reject();
                        }
                    } else if (data.status === 'active') {
                        clearInterval(timer);
                        resolve(instanceInfo);
                    } else {
                        retryCounter++;
                        if (retryCounter > 30) {
                            clearInterval(timer);
                            console.log(
                                'timeout: command shell did not become active',
                            );
                            reject();
                        }
                    }
                })
                .catch((err) => {
                    if (err === 'cancel') {
                        clearInterval(timer);
                        reject();
                        return;
                    }
                    console.log(err);
                });
        }, 1000);
    });
}
