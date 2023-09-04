import React, { useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

import type { CodeRuntimeInfo, PreludeKey } from 'docslab';

import type { DocslabCodeBlockProps } from '../types';


function Main(props: DocslabCodeBlockProps): JSX.Element
{
    const mainDiv = useRef<HTMLDivElement>(null);
    const noPrelude = !!props.noPrelude;

    useEffect(() => {
        if (mainDiv.current === null) {
            return;
        }

        import('docslab').then((docslab) => {
            if (mainDiv.current === null) {
                return;
            }

            const coderi: CodeRuntimeInfo = {
                readOnly: !!props.readOnly,
                ...(docslab.parseHardsharePath(props.hardshare))
            };

            if (!noPrelude && props.children) {
                const pm = docslab.parsePrelude(props.children);
                for (const k in pm) {
                    coderi[k as PreludeKey] = pm[k as PreludeKey];
                }
            }

            [
                'command',
                'destpath',
                'repoUrl',
                'repoScript',
                'urlfile',
            ].forEach((k) => {
                if (props[k as PreludeKey]) {
                    coderi[k as PreludeKey] = props[k as PreludeKey];
                }
            });

            if (props.exampleCode) {
                coderi.exampleCode = props.exampleCode;
            } else if (props.children && (noPrelude || !coderi.exampleCode)) {
                coderi.exampleCode = props.children;
            }

            if (props.className && props.className !== 'language-docslab' && props.className.startsWith('language-')) {
                const syntaxHighlight = props.className.substring(9);
                docslab.prepareSnippet(mainDiv.current, coderi, syntaxHighlight);
            } else {
                docslab.prepareSnippet(mainDiv.current, coderi);
            }
        });

        return () => {
            mainDiv.current?.replaceChildren();
        };
    }, [mainDiv]);

    return (
        <div ref={mainDiv}></div>
    );
}


export function DocslabCodeBlock(props: DocslabCodeBlockProps): JSX.Element
{
    return (
        <BrowserOnly fallback={<div>loading...</div>}>
            {() => (
                <Main {...props} />
            )}
        </BrowserOnly>
    );
}
