import type {
    PreludeKey,
    PreludeMap,
} from './types';


export function parsePrelude(codeBlob: string): PreludeMap
{
    const knownKeys: PreludeKey[] = [
        'command',
        'destpath',
        'repoUrl',
        'repoScript',
        'urlfile',
    ];
    const pm: PreludeMap = {};

    let start = 0;
    let end = codeBlob.indexOf('\n');
    while (end > 0) {
        let line = codeBlob.substring(start, end).trim();
        const previous = start;
        start = end + 1;
        end = codeBlob.indexOf('\n', start);

        if (line.startsWith('#')) {
            line = line.replace(/#+/, '');
        } if (line.startsWith(';')) {
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
        const key = line.substring(0, sep).trim();
        if (!knownKeys.includes(key as PreludeKey)) {
            break;
        }
        pm[key as PreludeKey] = line.substring(sep + 1).trim();
    }
    if (end > 0) {
        pm.exampleCode = codeBlob.substring(start);
    }

    return pm;
}
