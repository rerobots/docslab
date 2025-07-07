import BrowserOnly from '@docusaurus/BrowserOnly';
import React, { useEffect, useRef } from 'react';

import 'docslab/lib/main.css';
import type { PreludeMapBase, PreludeValue } from 'docslab';

import type { DocslabCodeBlockProps } from '../types';

type PreludeMapBaseKey = keyof PreludeMapBase;

function Main({
    className,
    command,
    destpath,
    exampleCode,
    hardshare,
    noPrelude,
    readOnly,
    repoScript,
    repoUrl,
    runEnv,
    urlfile,
    children,
}: DocslabCodeBlockProps): JSX.Element {
    const mainDiv = useRef<HTMLDivElement>(null);
    noPrelude = !!noPrelude;

    useEffect(() => {
        if (mainDiv.current === null) {
            return;
        }

        import('docslab').then((docslab) => {
            if (mainDiv.current === null) {
                return;
            }

            const coderi = docslab.initCodeRuntimeInfo(!!readOnly, hardshare);

            if (!noPrelude && children) {
                const pm = docslab.parsePrelude(children);

                for (const k in pm) {
                    coderi[k as PreludeMapBaseKey] = pm[
                        k as PreludeMapBaseKey
                    ] as PreludeValue;
                }
            }

            if (command) {
                coderi.command = command;
            }
            if (destpath) {
                coderi.destpath = destpath;
            }
            if (repoUrl) {
                coderi.repoUrl = repoUrl;
            }
            if (repoScript) {
                coderi.repoScript = repoScript;
            }
            if (runEnv) {
                coderi.runEnv = runEnv;
            }
            if (urlfile) {
                coderi.urlfile = urlfile;
            }

            if (exampleCode) {
                coderi.exampleCode = exampleCode;
            } else if (children && (noPrelude || !coderi.exampleCode)) {
                coderi.exampleCode = children;
            }

            if (
                className &&
                className !== 'language-docslab' &&
                className.startsWith('language-')
            ) {
                const syntaxHighlight = className.substring(9);
                docslab.prepareSnippet(
                    mainDiv.current,
                    coderi,
                    syntaxHighlight,
                );
            } else {
                docslab.prepareSnippet(mainDiv.current, coderi);
            }
        });

        return () => {
            mainDiv.current?.replaceChildren();
        };
    }, [
        children,
        className,
        command,
        destpath,
        exampleCode,
        hardshare,
        noPrelude,
        readOnly,
        repoScript,
        repoUrl,
        runEnv,
        urlfile,
    ]);

    return <div ref={mainDiv}></div>;
}

export function DocslabCodeBlock(props: DocslabCodeBlockProps): JSX.Element {
    return (
        <BrowserOnly fallback={<div>loading...</div>}>
            {() => <Main {...props} />}
        </BrowserOnly>
    );
}
