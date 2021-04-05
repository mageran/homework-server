class InputTile {
    constructor(id, options) {
        this.id = id;
        this.options = options || {};
    }

    get container() {
        if (!this.$div) {
            const cssClass = this.constructor.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            const div = _htmlElement('div', this.cont, null, cssClass);
            div.tile = this;
            this.$div = div;
        }
        return this.$div;
    }

    _addLabel(cont = this.container) {
        const { label, labelIsLatex } = this.options;
        if (label) {
            this.label = label;
            let labelElem = _htmlElement('label', cont);
            if (labelIsLatex) {
                let idiv = _htmlElement('div', labelElem)
                elemStyle(idiv, { display: 'inline-block' });
                addLatexElement(idiv, label);
            } else {
                labelElem.innerHTML = label;
            }
        }
    }

    createUI(cont) {
        this.cont = cont;
        return this.container;
    }

    getValue() {
        throw `getValue() not implemented for class ${this.constructor.name}`;
    }

    setInputValues() {

    }

    toLatex() {
        return '';
    }
}

class NumberInputTile extends InputTile {

    constructor(id, options) {
        super(id, options);
    }

    createUI(cont) {
        const o = super.createUI(cont);
        this._addLabel();
        const input = _htmlElement('input', o);
        this.input = input;
        const { selectOptions, selectCallback } = this.options;
        if (selectOptions) {
            this.selectObj = createSelectElement(o, selectOptions, selectCallback);
            elemStyle(this.selectObj.outerContainer, {
                verticalAlign: 'middle',
                padding: '10px'
            })
        }
        return o;
    }

    isEmpty() {
        return this.input.value.trim() === "";
    }

    getValue() {
        const numberValue = _d(this.input.value);
        var selectValue;
        if (this.selectObj) {
            selectValue = this.selectObj.selected.value;
        }
        return { numberValue, selectValue };
    }

    setInputValues(numberValue) {
        this.input.value = numberValue;
    }

}

class UnitInputTile extends NumberInputTile {
    constructor(id, options) {
        if (!options.unit) {
            throw "please specify 'unit' option when creating a UnitInputTile"
        }
        // see unit.js
        const units = Object.keys(UnitConversionsMap[options.unit]);
        if (Array.isArray(units)) {
            options.selectOptions = units.map(unit => ({ label: unit, value: unit }));
        } else {
            throw `unit "${options.unit}" not found`;
        }
        super(id, options);
        this.unit = options.unit;
        this.units = units;
    }

    getValue() {
        const valueObj = super.getValue();
        valueObj.unit = this.selectObj.selected.value;
        return valueObj;
    }

    setInputValues(numberValue, unit) {
        super.setInputValues(numberValue);
        this.selectObj.select(({value}) => value === unit);
    }

}

class PressureInputTile extends UnitInputTile {
    constructor(id, options) {
        options.unit = 'pressure';
        super(id, options);
    }
}

class WeightInputTile extends UnitInputTile {
    constructor(id, options) {
        options.unit = 'weight';
        super(id, options);
    }
}

class VolumeInputTile extends UnitInputTile {
    constructor(id, options) {
        options.unit = 'liquidVolume';
        super(id, options);
    }
}
class TemperatureInputTile extends UnitInputTile {
    constructor(id, options) {
        options.unit = 'temperature';
        super(id, options);
    }
}

class DensityInputTile extends UnitInputTile {
    constructor(id, options) {
        options.unit = 'density';
        super(id, options);
    }
}

class MassOrMolesInputTile extends NumberInputTile {
    constructor(id, options) {
        const massUnits = Object.keys(UnitConversionsMap.weight);
        const units = ['moles'].concat(massUnits);
        options.selectOptions = units.map(unit => ({ label: unit, value: unit }));
        options.selectCallback = selected => {
            const unit = selected.value;
            //console.log(`selected unit: ${unit}`);
            if (this.gasNameInputContainer) {
                this.gasNameInputContainer.style.visibility = unit === 'moles' ? 'hidden' : 'visible';
            }
        }
        super(id, options);
        this.units = units;
    }

    createUI(cont) {
        const o = super.createUI(cont);
        const span = _htmlElement('span', o, null, 'gas-name-container');
        this.gasNameInputContainer = span;
        _htmlElement('label', span, "Gas formula or name:");
        const gasNameInput = _htmlElement('input', span)
        this.gasNameInput = gasNameInput;
        elemStyle(span, { visibility: 'hidden' });
        return o;
    }

    getValue() {
        const valueObj = super.getValue();
        valueObj.unit = this.selectObj.selected.value;
        valueObj.gasFormulaOrName = this.gasNameInput.value;
        valueObj.formula = valueObj.gasFormulaOrName;
        if (valueObj.formula) {
            // let it fail
            let molarMass = getMolarMassFromFormula(valueObj.formula);
            valueObj.molarMass = molarMass;
        }
        return valueObj;
    }
}

class MolarMassInputTile extends WeightInputTile {

    createUI(cont) {

        const updateMolarMass = () => {
            const formula = this.gasNameInput.value;
            try {
                const molarMass = getMolarMassFromFormula(formula);
                const unit = this.selectObj.selected.value;
                var massValue = molarMass
                if (unit !== 'g') {
                    const convInfo = convertUnit('g', unit, molarMass);
                    massValue = convInfo.result;
                }
                this.input.value = massValue;
            } catch (err) {
                console.error(err);
            }
        }

        this.options.selectCallback = () => {
            this.input.value = "";
            if (this.gasNameInput) {
                updateMolarMass();
            }
        };
        const o = super.createUI(cont);
        const span = _htmlElement('span', o, null, 'gas-name-container');
        this.gasNameInputContainer = span;
        _htmlElement('label', span, "Gas formula:");
        const gasNameInput = _htmlElement('input', span)
        this.gasNameInput = gasNameInput;
        const b = _htmlElement('input', span);
        b.type = 'button';
        b.value = 'Calculate and insert molar mass';
        elemStyle(b, { marginLeft: '10px' });
        b.addEventListener('click', updateMolarMass)
        return o;
    }

}


// --------------------------------------------------
class TileContainer extends InputTile {
    constructor(id, options) {
        super(id, options);
    }

    createUI(cont) {
        const o = super.createUI(cont);
    }

    clear() {
        this.container.innerHTML = "";
    }

    addTile(tile) {
        // tile instanceof InputTile
        tile.createUI(this.container);
    }

    getAllNumberInputTiles() {
        const tiles = [];
        const children = this.container.children;
        for (let i = 0; i < children.length; i++) {
            let cnode = children[i];
            let tile = cnode.tile;
            if (tile instanceof NumberInputTile) {
                tiles.push(tile);
            }
        }
        return tiles;
    }

    getMissingValueTiles() {
        return this.getAllNumberInputTiles().filter(tile => tile.isEmpty());
    }

    getTile(id) {
        const children = this.container.children;
        for (let i = 0; i < children.length; i++) {
            let cnode = children[i];
            let tile = cnode.tile;
            if (tile instanceof InputTile) {
                if (tile.id === id) {
                    return tile;
                }
            }
        }
        return null;
    }

    getValue(id) {
        const tile = this.getTile(id);
        if (!tile) {
            return null;
        }
        return tile.getValue()
    }
}