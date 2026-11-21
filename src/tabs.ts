type TabName = 'editor' | 'terminal' | 'camera';

const tabs: { name: TabName; label: string; panelClass: string }[] = [
    { name: 'editor', label: 'Code', panelClass: 'docslabEditor' },
    { name: 'terminal', label: 'Terminal', panelClass: 'dl-terminalContainer' },
    { name: 'camera', label: 'Camera', panelClass: 'dl-cameraImg' },
];

export function setupTabs(root: HTMLElement, runButton: HTMLButtonElement) {
    root.classList.add('dl-tabs');

    const tabBar = document.createElement('div');
    tabBar.className = 'dl-tabBar';
    tabBar.setAttribute('role', 'tablist');

    const hasPanel = (panelClass: string) => {
        for (const child of Array.from(root.children)) {
            if (child.classList.contains(panelClass)) {
                return true;
            }
        }
        return false;
    };

    const tabButtons = tabs.map((tab) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = tab.label;
        button.classList.add('dl-tab', `dl-tab-${tab.name}`);
        button.setAttribute('role', 'tab');
        button.addEventListener('click', () => {
            selectTab(tab.name);
        });
        tabBar.appendChild(button);
        return button;
    });
    root.prepend(tabBar);

    const selectTab = (name: TabName) => {
        const tab = tabs.find((t) => t.name === name);
        if (!tab || !hasPanel(tab.panelClass)) {
            name = 'editor';
        }
        root.dataset.dlActiveTab = name;
        tabs.forEach((t, idx) => {
            tabButtons[idx].setAttribute(
                'aria-selected',
                t.name === name ? 'true' : 'false',
            );
        });
    };

    const updateAvailability = () => {
        tabs.forEach((t, idx) => {
            tabButtons[idx].disabled = !hasPanel(t.panelClass);
        });
        selectTab((root.dataset.dlActiveTab as TabName) || 'editor');
    };

    const observer = new MutationObserver((records) => {
        if (tabBar.parentElement !== root) {
            observer.disconnect();
            return;
        }
        updateAvailability();
        const terminalAdded = records.some((r) =>
            Array.from(r.addedNodes).some(
                (node) =>
                    node instanceof HTMLElement &&
                    node.classList.contains('dl-terminalContainer'),
            ),
        );
        if (terminalAdded) {
            selectTab('terminal');
        }
    });
    observer.observe(root, { childList: true });

    runButton.addEventListener('click', () => {
        selectTab('terminal');
    });

    selectTab('editor');
    updateAvailability();
}
