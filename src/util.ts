import type {
    CodeRuntimeInfo,
    HardsharePath,
    LineRange,
    PreludeKey,
    PreludeMap,
} from './types';

export function getCodeRegion(
    codeBlob: string,
    lineRange: LineRange,
    lineEnding?: '\n' | '\r\n',
): [number, number, number] {
    if (!lineEnding) {
        const firstLineFeed = codeBlob.indexOf('\n');
        if (firstLineFeed === 0) {
            lineEnding = '\n';
        } else if (codeBlob[firstLineFeed - 1] === '\r') {
            lineEnding = '\r\n';
        } else {
            lineEnding = '\n';
        }
    }
    let startLineIndex;
    let endLineIndex;

    if (lineRange[1] === -1) {
        endLineIndex = codeBlob.length - 1;
    }

    let start = 0;
    let end = codeBlob.indexOf(lineEnding);
    let currentLine = 0;
    while (start < codeBlob.length) {
        currentLine += 1;
        if (startLineIndex === undefined && currentLine === lineRange[0]) {
            startLineIndex = start;
        }
        if (endLineIndex === undefined && currentLine === lineRange[1]) {
            endLineIndex = end;
            break;
        }

        start = end + lineEnding.length;
        if (start >= codeBlob.length) {
            break;
        }
        end = codeBlob.indexOf(lineEnding, start);
        if (end < 0) {
            end = codeBlob.length - 1;
        }
    }

    if (startLineIndex === undefined || endLineIndex === undefined) {
        throw new Error('Line range outside given code');
    }

    return [startLineIndex, endLineIndex, currentLine];
}

export function parseHardsharePath(hspath: string): HardsharePath {
    const sep = hspath.indexOf('/');
    if (sep < 1 || sep >= hspath.length - 1) {
        throw new Error(`separator '/' not found in '${hspath}'`);
    }

    return {
        hardshareO: hspath.substring(0, sep),
        hardshareId: hspath.substring(sep + 1),
    };
}

export function parsePrelude(codeBlob: string): PreludeMap {
    const knownKeys: PreludeKey[] = [
        'command',
        'destpath',
        'hardshare',
        'lineRange',
        'refUrl',
        'repoScript',
        'repoUrl',
        'urlfile',
    ];
    const pm: PreludeMap = {
        runEnv: 'ssh',
    };

    let start = 0;
    let end = codeBlob.indexOf('\n');
    while (end > 0) {
        let line = codeBlob.substring(start, end).trim();
        const previous = start;
        start = end + 1;
        end = codeBlob.indexOf('\n', start);

        if (line.startsWith('#')) {
            line = line.replace(/#+/, '');
        }
        if (line.startsWith(';')) {
            line = line.replace(/;+/, '');
        } else if (line.startsWith('/*')) {
            const matchingEnd = line.endsWith('*/');
            line = line.replace(/\/\*+/, '');
            if (matchingEnd && !line.endsWith('*/')) {
                // Special case for long comment lines of the form /*******/
                line = line.substring(1);
            }
        } else if (line.startsWith('/')) {
            line = line.replace(/\/+/, '');
        }
        if (line.endsWith('*/')) {
            line = line.substring(0, line.length - 2);
        }
        line = line.trim();
        if (line.length === 0) {
            continue;
        }
        const sep = line.indexOf(':');
        if (sep < 1) {
            if (!line.startsWith('---')) {
                start = previous;
            }
            break;
        }
        const key = line.substring(0, sep).trim() as PreludeKey;
        if (!knownKeys.includes(key)) {
            break;
        }
        if (key === 'lineRange') {
            const parts = line
                .substring(sep + 1)
                .trim()
                .split(',')
                .map((x) => x.trim());
            if (parts.length !== 2) {
                throw new Error('unexpected number of parameters in lineRange');
            }
            pm.lineRange = [Number(parts[0]), Number(parts[1])];
            if (pm.lineRange[0] < 1) {
                throw new Error('start line must be >= 1');
            }
            if (pm.lineRange[1] < -1 || pm.lineRange[1] === 0) {
                throw new Error('end line must be -1 or >= 1');
            }
        } else if (key === 'hardshare') {
            pm.hardshare = parseHardsharePath(line.substring(sep + 1).trim());
        } else if (key === 'runEnv') {
            const runEnv = line.substring(sep + 1).trim();
            if (runEnv === 'py' || runEnv === 'ssh') {
                pm.runEnv = runEnv;
            } else {
                throw new Error(`unexpected runEnv: ${runEnv}`);
            }
        } else if (key === 'addons') {
            const addons = line.substring(sep + 1).trim();
            pm.addons = addons.split(',').map((w) => w.trim());
        } else {
            pm[key] = line.substring(sep + 1).trim();
        }
    }
    if (end > 0) {
        pm.exampleCode = codeBlob.substring(start);
    }

    // Default add-ons
    if (pm.runEnv === 'ssh' && (!pm.addons || pm.addons.length === 0)) {
        pm.addons = ['cmdsh'];
    }

    return pm;
}

export function parseRootData(
    root: HTMLDivElement | HTMLPreElement,
    strict?: boolean,
): CodeRuntimeInfo | null {
    if (!('hardshareo' in root.dataset)) {
        if (strict) {
            throw new Error('hardshareo not defined');
        }
        return null;
    }
    if (!('hardshareid' in root.dataset)) {
        if (strict) {
            throw new Error('hardshareid not defined');
        }
        return null;
    }
    const coderi: CodeRuntimeInfo = {
        readOnly: 'readonly' in root.dataset || false,
        hardshareO: root.dataset['hardshareo'] as string,
        hardshareId: root.dataset['hardshareid'] as string,
        runEnv: 'ssh',
    };
    const exampleBlockElement = root.getElementsByTagName('code')[0];
    if (exampleBlockElement) {
        coderi.exampleCode = exampleBlockElement.innerText;
        root.removeChild(exampleBlockElement.parentElement as Node);
    }
    if ('runenv' in root.dataset) {
        if (
            root.dataset['runenv'] === 'py' ||
            root.dataset['runenv'] === 'ssh'
        ) {
            coderi.runEnv = root.dataset['runenv'];
        } else {
            throw new Error(`unexpected runenv: ${root.dataset['runenv']}`);
        }
    }
    if ('addons' in root.dataset && root.dataset['addons']) {
        coderi.addons = root.dataset.addons.split(',').map((w) => w.trim());
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
    if ('refurl' in root.dataset) {
        coderi.refUrl = root.dataset['refurl'];
    }
    if ('iscript' in root.dataset) {
        coderi.repoScript = root.dataset['iscript'];
    }
    if ('urlfile' in root.dataset) {
        coderi.urlfile = root.dataset['urlfile'];
    }
    if ('lrange' in root.dataset && root.dataset['lrange']) {
        const parts = root.dataset['lrange'].split(',').map((x) => x.trim());
        if (parts.length !== 2) {
            throw new Error('unexpected number of parameters in lrange');
        }
        coderi.lineRange = [Number(parts[0]), Number(parts[1])];
    }

    // Default add-ons
    if (
        coderi.runEnv === 'ssh' &&
        (!coderi.addons || coderi.addons.length === 0)
    ) {
        coderi.addons = ['cmdsh'];
    }

    return coderi;
}

export function initCodeRuntimeInfo(
    readOnly?: boolean,
    hspath?: string,
): CodeRuntimeInfo {
    const coderi: CodeRuntimeInfo = {
        hardshareO: '',
        hardshareId: '',
        readOnly: !!readOnly,
        runEnv: 'ssh',
    };
    if (hspath) {
        const hs = parseHardsharePath(hspath);
        coderi.hardshareO = hs.hardshareO;
        coderi.hardshareId = hs.hardshareId;
    }
    return coderi;
}
