/// <reference types="@docusaurus/module-type-alias" />

declare module '@theme-init/CodeBlock' {
    export interface Props {
        readonly children: string;
        readonly className?: string;
        readonly metastring?: string;
    }

    const CodeBlock: (props: Props) => JSX.Element;
    export default CodeBlock;
}
