import * as React from 'react';

import CodeBlock from '@theme-init/CodeBlock';

import type { CodeBlockSwitchProps, DocslabCodeBlockProps } from '../types';
import { DocslabCodeBlock } from '../DocslabCodeBlock';

function parseMetastring(metastring: string): string | null {
    const parts = metastring.split(' ');
    if (parts.length >= 3) {
        return null;
    }

    const parseHardshareKV = (x: string) => {
        const sep = x.indexOf('=');
        if (sep < 0) {
            return null;
        }
        if (x.substring(0, sep) !== 'hardshare') {
            return null;
        }
        return x.substring(sep + 1);
    };

    if (parts.length === 1) {
        return parseHardshareKV(parts[1]);
    } else {
        if (parts[0] !== 'docslab') {
            return null;
        }
        return parseHardshareKV(parts[1]);
    }
}

function SwitchedCodeBlock(props: CodeBlockSwitchProps): JSX.Element {
    if (
        props.hardshare &&
        (props.docslab || props.className === 'language-docslab')
    ) {
        const extProps: DocslabCodeBlockProps = {
            hardshare: props.hardshare,
            ...props,
        };
        return <DocslabCodeBlock {...extProps} />;
    } else if (
        props.metastring &&
        (props.className === 'language-docslab' ||
            props.metastring.includes('docslab'))
    ) {
        const hardshare = parseMetastring(props.metastring);
        if (hardshare) {
            const extProps: DocslabCodeBlockProps = {
                hardshare: hardshare,
                ...props,
            };
            return <DocslabCodeBlock {...extProps} />;
        }
    }
    return <CodeBlock {...props} />;
}

export default SwitchedCodeBlock;
