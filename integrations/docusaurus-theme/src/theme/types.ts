import type { PreludeMapBase } from 'docslab';

import type { Props } from '@theme-init/CodeBlock';

export interface CodeBlockSwitchProps extends Props {
    readonly docslab?: boolean;
    readonly hardshare?: string;
    readonly readOnly?: boolean;
    readonly runEnv?: 'py' | 'ssh';
}

export interface DocslabCodeBlockProps extends PreludeMapBase, Props {
    hardshare: string;
    noPrelude?: boolean;
    readOnly?: boolean;
}
