function chemicalLawsUI(o, lawsOptions, options = {}) {
    const defaultTitle = "Select which law to use";
    const title = options.title || defaultTitle;
    o.style.fontSize = "18pt";
    try {

        _htmlElement('div', o, `${title}: `);
        const output = document.createElement('div');
        var currentContainer = null;
        const lawSelect = createSelectElement(o, lawsOptions, selected => {
            if (!selected.value) return;
            console.log(`selected: ${selected.value}`);
            output.innerHTML = "";
            for (let { value, containerClass } of lawsOptions) {
                if (!value) continue;
                if (!containerClass) continue;
                if (selected.value === value) {
                    console.log(`creating instance of class %o...`, containerClass);
                    currentContainer = new containerClass();
                    break;
                }
            }
            if (currentContainer) {
                console.log(`createUI...`);
                currentContainer.createUI(output);
            }
        });
        lawSelect.outerContainer.style.height = '80px';
        if (options.menuContainerWidth) {
            lawSelect.outerContainer.style.width = options.menuContainerWidth;
        }
        if (options.menuWidth) {
            lawSelect.selectMenuContainer.style.width = options.menuWidth;
        }
        o.appendChild(output);
    } catch (err) {
        _addErrorElement(o, err);
    }
}
