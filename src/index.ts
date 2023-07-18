export function prepareSnippet(element: HTMLElement)
{
    let hardshareId = element.dataset['hardshareid'];
}


export function loadAll()
{
    const codeBlocks = document.getElementsByClassName("docslab");
    for (let j = 0; j < codeBlocks.length; j++) {
        prepareSnippet(codeBlocks[j] as HTMLElement);
    }
}