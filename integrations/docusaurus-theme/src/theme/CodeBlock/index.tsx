import * as React from 'react';

import CodeBlock from '@theme-init/CodeBlock';

import type { CodeBlockSwitchProps, DocslabCodeBlockProps } from '../types';
import { DocslabCodeBlock } from '../DocslabCodeBlock';


function SwitchedCodeBlock(props: CodeBlockSwitchProps): JSX.Element {
    if (props.hardshare && (props.docslab || props.className === 'language-docslab')) {
        const extProps: DocslabCodeBlockProps = {
            hardshare: props.hardshare,
            ...props
        };
        return <DocslabCodeBlock {...extProps} />;
    }
    return <CodeBlock {...props} />;
}

export default SwitchedCodeBlock;
