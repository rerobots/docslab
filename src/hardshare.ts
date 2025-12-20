import * as z from 'zod';

import { instanceKeepAlive } from 'rerobots';
import type { CodeRuntimeInfo, InstanceInfo, InstanceParams } from './types';

interface CancelFlag {
    cancelled: boolean;
}

function checkIfCancelled(cancelFlag?: CancelFlag, reject?: () => void) {
    if (cancelFlag?.cancelled) {
        if (reject) {
            reject();
        } else {
            throw 'cancel';
        }
    }
}

const TokenUPSandboxSchema = z.object({
    u: z.string(),
    tok: z.jwt(),
    tok64: z.base64(),
    nonce: z.string().optional(),
});

export function getApiToken(
    hardshareO: string,
    hardshareId: string,
    cancelFlag?: CancelFlag,
): Promise<string[]> {
    return new Promise((resolve, reject) => {
        if (hardshareO === 'test') {
            resolve(['fake', 'fake64']);
            return;
        }

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
                    payload = TokenUPSandboxSchema.parse(payload);
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
                    resolve([payload.tok, payload.tok64]);
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
    cancelFlag?: CancelFlag,
): Promise<CodeRuntimeInfo> {
    return new Promise((resolve, reject) => {
        if (coderi.hardshareO === 'test') {
            coderi.instance ||= {};
            Object.assign(coderi.instance, {
                id: '1926b858-0d00-4b84-b7ca-5c56be880525', // fake
                status: 'INIT',
            });
            resolve(coderi);
            return;
        }

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
                    coderi.instance ||= {};
                    Object.assign(coderi.instance, {
                        destpath: payload.destpath,
                        command:
                            payload.btn_command || 'echo "no run command set"',
                    });
                    checkIfCancelled(cancelFlag);
                    return fetch('https://api.rerobots.net/new', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${coderi.instance.token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newInstanceParams),
                    });
                })
                .then((res) => {
                    checkIfCancelled(cancelFlag);
                    if (res.status === 400) {
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
                    coderi.instance ||= {};
                    instanceKeepAlive(
                        payload.id,
                        coderi.instance.token as string,
                    );
                    coderi.instance.id = payload.id;
                    coderi.instance.status = 'INIT';
                    resolve(coderi);
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
    coderi: CodeRuntimeInfo,
    cancelFlag?: CancelFlag,
): Promise<CodeRuntimeInfo> {
    return new Promise((resolve, reject) => {
        if (coderi.hardshareO === 'test') {
            coderi.instance ||= {};
            coderi.instance.addons ||= {};
            coderi.instance.addons.cmdsh = true;
            resolve(coderi);
            return;
        }

        let retryCounter = 0;
        const timer = setInterval(() => {
            checkIfCancelled(cancelFlag, () => {
                clearInterval(timer);
                reject();
            });

            if (!coderi.instance?.id || !coderi.instance?.token) {
                clearInterval(timer);
                const err = new Error(
                    'prepareShell called without instance ID/token',
                );
                console.error(err);
                reject(err);
                return;
            }

            fetch(
                `https://api.rerobots.net/addon/cmdsh/${coderi.instance.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${coderi.instance.token}`,
                    },
                },
            )
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

                        if (!coderi.instance?.id || !coderi.instance?.token) {
                            clearInterval(timer);
                            const err = new Error(
                                'prepareShell called without instance ID/token',
                            );
                            console.error(err);
                            reject(err);
                            return;
                        }

                        fetch(
                            'https://api.rerobots.net/addon/cmdsh/' +
                                coderi.instance.id,
                            {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${coderi.instance.token}`,
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
                        coderi.instance ||= {};
                        coderi.instance.addons ||= {};
                        coderi.instance.addons.cmdsh = true;
                        resolve(coderi);
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

export function createMistyProxy(
    coderi: CodeRuntimeInfo,
    cancelFlag?: CancelFlag,
): Promise<CodeRuntimeInfo> {
    return new Promise((resolve, reject) => {
        if (coderi.hardshareO === 'test') {
            coderi.instance ||= {};
            coderi.instance.addons ||= {};
            coderi.instance.addons.mistyproxy = 'http://localhost/mistyproxy';
            resolve(coderi);
            return;
        }

        let retryCounter = 0;
        const timer = setInterval(() => {
            checkIfCancelled(cancelFlag, () => {
                clearInterval(timer);
                reject();
            });

            if (!coderi.instance?.id || !coderi.instance?.token) {
                clearInterval(timer);
                const err = new Error(
                    'createMistyProxy called without instance ID/token',
                );
                console.error(err);
                reject(err);
                return;
            }

            fetch(
                'https://api.rerobots.net/addon/mistyproxy/' +
                    coderi.instance.id,
                {
                    headers: {
                        Authorization: `Bearer ${coderi.instance.token}`,
                    },
                },
            )
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

                        if (!coderi.instance?.id || !coderi.instance?.token) {
                            clearInterval(timer);
                            const err = new Error(
                                'createMistyProxy called without instance ID/token',
                            );
                            console.error(err);
                            reject(err);
                            return;
                        }

                        fetch(
                            'https://api.rerobots.net/addon/mistyproxy/' +
                                coderi.instance.id,
                            {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${coderi.instance.token}`,
                                },
                            },
                        );
                        retryCounter++;
                        if (retryCounter > 30) {
                            clearInterval(timer);
                            console.log('timeout: mistyproxy did not start');
                            reject();
                        }
                    } else if (data.status === 'active') {
                        clearInterval(timer);
                        coderi.instance ||= {};
                        coderi.instance.addons ||= {};
                        coderi.instance.addons.mistyproxy = data.url[1];
                        resolve(coderi);
                    } else {
                        retryCounter++;
                        if (retryCounter > 30) {
                            clearInterval(timer);
                            console.log('timeout: mistyproxy not active');
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

export function getInstanceInfo(
    coderi: CodeRuntimeInfo,
    cancelFlag?: CancelFlag,
): Promise<InstanceInfo> {
    return new Promise((resolve, reject) => {
        if (coderi.hardshareO === 'test') {
            resolve({
                id: '1926b858-0d00-4b84-b7ca-5c56be880525', // fake
                status: 'READY',
                expiration: Date.now() + 300e3, // 5 minutes in future
                token: 'fake',
                token64: 'fakeb64',
            });
            return;
        }

        if (!coderi.instance?.id || !coderi.instance?.token) {
            const err = new Error(
                'getInstanceInfo called without instance ID/token',
            );
            console.error(err);
            reject(err);
            return;
        }
        const instanceId = coderi.instance.id;
        const token = coderi.instance.token;

        let retryCounter = 0;
        const requestInstanceInfo = () => {
            fetch(`https://api.rerobots.net/instance/${instanceId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    checkIfCancelled(cancelFlag);
                    if (res.ok) {
                        return res.json();
                    }
                    throw new Error(res.url);
                })
                .then((payload) => {
                    resolve({
                        id: payload.id,
                        status: payload.status,
                        expiration: new Date(`${payload.expires}Z`).valueOf(),
                    });
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
                    setTimeout(requestInstanceInfo, 1000 * 2 ** retryCounter);
                });
        };
        requestInstanceInfo();
    });
}

export function attachCameraStream(
    coderi: CodeRuntimeInfo,
    root: HTMLElement,
    el: HTMLImageElement,
    width?: number,
    height?: number,
): Promise<void> {
    if (coderi.hardshareO === 'test') {
        return Promise.resolve();
    }

    if (!coderi.instance?.id || !coderi.instance?.token) {
        throw new Error('attachCameraStream called without instance ID/token');
    }

    const instanceId = coderi.instance.id;
    const token = coderi.instance.token;
    const token64 = coderi.instance.token64;

    return fetch(`https://api.rerobots.net/addon/cam/${instanceId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
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
                root.appendChild(el);
                const camWs = new WebSocket(
                    `wss://api.rerobots.net/addon/cam/${instanceId}/0/feed/${token64}`,
                );
                camWs.addEventListener('message', (event) => {
                    el.src = event.data;
                });
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

export function terminateInstance(coderi: CodeRuntimeInfo): Promise<void> {
    if (coderi.hardshareO === 'test') {
        return Promise.resolve();
    }

    if (!coderi.instance?.id || !coderi.instance?.token) {
        throw new Error('terminateInstance called without instance ID/token');
    }

    const instanceId = coderi.instance.id;
    const token = coderi.instance.token;

    return fetch(`https://api.rerobots.net/terminate/${instanceId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    }).then((res) => {
        if (!res.ok) {
            throw new Error(res.url);
        }
    });
}
