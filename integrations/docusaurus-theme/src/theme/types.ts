import type { PreludeMap } from 'docslab';

import type { Props } from '@theme-init/CodeBlock';


export interface CodeBlockSwitchProps extends Props {
    readonly docslab?: boolean;
    readonly hardshare?: string;
    readonly readonly?: boolean;
}

export interface DocslabCodeBlockProps extends PreludeMap, Props {
    hardshare: string;
    noPrelude?: boolean;
    readOnly?: boolean;
}
