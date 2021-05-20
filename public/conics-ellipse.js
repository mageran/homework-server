// ellipse variants
const MAJOR_AXIS_HORIZONTAL = 0;
const MAJOR_AXIS_VERTICAL = 1;

function createEllipseInputFields(problemClass) {
    if (problemClass === 'fromEquation') {
        return [{ name: 'Ellipse Equation', type: 'formula', cssClass: 'width500' }];
    }
    else if (problemClass === 'fromParameters') {
        return [
            { html: '<h3>Enter information you have (3 values needed)</h3>'},
            { name: _fwl('Center Point (h,k)', 200), value: '', noEval: true, placeholder: '(h,k)' },
            { html: '<hr/>'},
            { separator: true },
            { name: _fwl('Vertex Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { name: _fwl('Vertex Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { html: '<hr/>'},
            { separator: true },
            { name: _fwl('Covertex Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { name: _fwl('Coertex Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { html: '<hr/>'},
            { separator: true },
            { name: _fwl('Focus Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { name: _fwl('Focus Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { separator: true },
        ];
    }
}

function conicsEllipse(problemClass, ...args) {
    const o = this;
    elemStyle(o, { fontSize: '16pt' });
     try {
        const steps = [];
        if (problemClass === 'fromEquation') {
            //parabolaFromEquation(o, ...args);
        }
        else if (problemClass === 'fromParameters') {
            //steps.push(...fromVertexAndDirectrix(...args));
        }
        _showComputationSteps(o, steps);
    } catch (err) {
        _addErrorElement(o, JSON.stringify(err, null, 2));
        throw err
    }
}
