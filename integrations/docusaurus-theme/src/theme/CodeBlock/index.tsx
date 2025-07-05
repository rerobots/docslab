import CodeBlock from '@theme-init/CodeBlock';
import { DocslabCodeBlock } from '../DocslabCodeBlock';
import type { CodeBlockSwitchProps, DocslabCodeBlockProps } from '../types';

interface Meta {
    hardshare: string;
    readOnly?: boolean;
    runEnv?: 'ssh' | 'py';
}

function parseMetastring(metastring: string): Meta | null {
    const parts = metastring.split(' ').filter((x) => x.length);
    if (parts.length < 2 || parts[0] !== 'docslab') {
        return null;
    }

    const meta: Meta = {
        hardshare: '',
    };

    const parseKV = (prefix: string, x: string): string => {
        const sep = x.indexOf('=');
        if (sep < 0) {
            return '';
        }
        if (x.substring(0, sep) !== prefix) {
            return '';
        }
        return x.substring(sep + 1);
    };

    for (const part of parts) {
        if (part.startsWith('hardshare')) {
            meta.hardshare = parseKV('hardshare', part);
        } else {
            if (part === 'readonly' || part === 'readOnly') {
                meta.readOnly = true;
            } else if (part.startsWith('runEnv')) {
                const runEnv = parseKV('runEnv', part);
                if (runEnv === 'ssh' || runEnv === 'py') {
                    meta.runEnv = runEnv;
                } else {
                    console.warn(`ignorning unknown runEnv: ${runEnv}`);
                }
            }
        }
    }

    // hardshare is required
    if (!meta.hardshare) {
        return null;
    }

    return meta;
}

function SwitchedCodeBlock(props: CodeBlockSwitchProps): JSX.Element {
    if (
        props.hardshare &&
        (props.docslab || props.className === 'language-docslab')
    ) {
        const extProps: DocslabCodeBlockProps = {
            hardshare: props.hardshare,
            runEnv: props.runEnv || 'ssh',
            ...props,
        };
        return <DocslabCodeBlock {...extProps} />;
    } else if (
        props.metastring &&
        (props.className === 'language-docslab' ||
            props.metastring.includes('docslab'))
    ) {
        const meta = parseMetastring(props.metastring);
        if (meta) {
            const extProps: DocslabCodeBlockProps = {
                runEnv: props.runEnv || meta.runEnv || 'ssh',
                ...props,
                ...meta,
            };
            return <DocslabCodeBlock {...extProps} />;
        }
    }
    return <CodeBlock {...props} />;
}

export default SwitchedCodeBlock;
