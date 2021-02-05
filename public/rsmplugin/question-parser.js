
const substitutions = {
    '÷': '/',
    '·': '*',
    '∙': '*',
    '+': '+',
    '−': '-',
};

const hasClass = (elem, clname) => {
    const cname = elem.className;
    const classnames = cname.split(/\s+/);
    return classnames.includes(clname);
}

const filterChildNodes = (elem, filterFun) => {
    const fnodes = [];
    if (elem.hasChildNodes()) {
        const cnodes = elem.childNodes;
        for (let i = 0; i < cnodes.length; i++) {
            let cnode = cnodes[i];
            let addIt = false;
            try {
                addIt = filterFun.call(null, cnode);
            } catch (err) {
            }
            if (addIt) {
                fnodes.push(cnode);
            }
            let subnodes = filterChildNodes(cnode, filterFun);
            fnodes.push(...subnodes);
        }
    }
    return fnodes;
}

const getChildNodeWithClass = (elem, clname) => {
    const cnodes = filterChildNodes(elem, cnode => hasClass(cnode, clname));
    if (cnodes.length === 0) {
        return null;
    }
    return cnodes[0];
}

/**
 * parses the html of the formula field and creates a formula text
 * @param {} elem 
 */
const parseFormula = elem => {
    const textParts = [];
    if (elem === null) {
        return '???';
    }
    if (elem.hasChildNodes()) {
        const cnodes = elem.childNodes;
        for (let i = 0; i < cnodes.length; i++) {
            let cnode = cnodes[i];
            if (cnode instanceof Text) {
                let text = String(cnode.nodeValue)
                    .replaceAll('∙', '*')
                    .replaceAll('\u2219', '*')
                    .replaceAll('÷', '/')
                    .replaceAll('\u00F7', '/')
                    .replaceAll('·', '*')
                    .replaceAll('\u00B7', '*')
                    .replaceAll('−', '-')
                    .replaceAll('\u2212', '-')
                textParts.push(text);
            }
            else if (cnode instanceof HTMLElement) {
                if (cnode.tagName === 'SUP') {
                    let s = "^(";
                    s += parseFormula(cnode);
                    s += ')';
                    textParts.push(s);
                }
                else if (cnode.tagName === 'TABLE' && hasClass(cnode, 'fraction')) {
                    let s = "$fraction(";
                    let ftop = getChildNodeWithClass(cnode, "fraction-top");
                    s += "(";
                    s += parseFormula(ftop);
                    s += ")";
                    s += ",";
                    let fbottom = getChildNodeWithClass(cnode, "fraction-bottom");
                    s += "(";
                    s += parseFormula(fbottom);
                    s += ")";
                    s += ")";
                    textParts.push(s);
                }
                else {
                    textParts.push(parseFormula(cnode));
                }
            }
        }
    }
    const res = textParts.join('');
    return res;
}

const remoteParseSelection = () => {
    const parseFormula = elem => {
        const hasClass = (elem, clname) => {
            const cname = elem.className;
            const classnames = cname.split(/\s+/);
            return classnames.includes(clname);
        }
        const getChildNodeWithClass = (elem, clname) => {
            const cnodes = filterChildNodes(elem, cnode => hasClass(cnode, clname));
            if (cnodes.length === 0) {
                return null;
            }
            return cnodes[0];
        }
        const filterChildNodes = (elem, filterFun) => {
            const fnodes = [];
            if (elem.hasChildNodes()) {
                const cnodes = elem.childNodes;
                for (let i = 0; i < cnodes.length; i++) {
                    let cnode = cnodes[i];
                    let addIt = false;
                    try {
                        addIt = filterFun.call(null, cnode);
                    } catch (err) {
                    }
                    if (addIt) {
                        fnodes.push(cnode);
                    }
                    let subnodes = filterChildNodes(cnode, filterFun);
                    fnodes.push(...subnodes);
                }
            }
            return fnodes;
        }
        const textParts = [];
        if (elem === null) {
            return '???';
        }
        if (elem.hasChildNodes()) {
            const cnodes = elem.childNodes;
            for (let i = 0; i < cnodes.length; i++) {
                let cnode = cnodes[i];
                if (cnode instanceof Text) {
                    let text = String(cnode.nodeValue)
                        .replaceAll('∙', '*')
                        .replaceAll('\u2219', '*')
                        .replaceAll('÷', '/')
                        .replaceAll('\u00F7', '/')
                        .replaceAll('·', '*')
                        .replaceAll('\u00B7', '*')
                        .replaceAll('−', '-')
                        .replaceAll('\u2212', '-')
                    textParts.push(text);
                }
                else if (cnode instanceof HTMLElement) {
                    console.log(`tagName: ${cnode.tagName}`)
                    if (cnode.tagName === 'SUP') {
                        let s = "^(";
                        s += parseFormula(cnode);
                        s += ')';
                        textParts.push(s);
                    }
                    else if ((cnode.tagName === 'TABLE' && hasClass(cnode, 'fraction')) ||
                        (cnode.tagName === 'TBODY' && getChildNodeWithClass(cnode, 'fraction-top') && getChildNodeWithClass(cnode, 'fraction-bottom'))) {
                        let s = "$fraction(";
                        let ftop = getChildNodeWithClass(cnode, "fraction-top");
                        s += "(";
                        s += parseFormula(ftop);
                        s += ")";
                        s += ",";
                        let fbottom = getChildNodeWithClass(cnode, "fraction-bottom");
                        s += "(";
                        s += parseFormula(fbottom);
                        s += ")";
                        s += ")";
                        textParts.push(s);
                    }
                    else {
                        textParts.push(parseFormula(cnode));
                    }
                }
            }
        }
        const res = textParts.join('');
        return res;
    };
    console.clear();
    const selectedNodes = [];
    const _collectSelectedNodes = (elem = document.body) => {
        if (window.getSelection().containsNode(elem)) {
            selectedNodes.push(elem);
            return;
        }
        if (elem.hasChildNodes()) {
            const cnodes = elem.childNodes;
            var hasSomeSelectedChildNodes = false;
            for (let i = 0; i < cnodes.length; i++) {
                let cnode = cnodes[i];
                if (window.getSelection().containsNode(cnode)) {
                    hasSomeSelectedChildNodes = true;
                    break;
                }
            }
            if (hasSomeSelectedChildNodes) {
                selectedNodes.push(elem);
            } else {
                for (let i = 0; i < cnodes.length; i++) {
                    let cnode = cnodes[i];
                    _collectSelectedNodes(cnode);

                }
            }

        }
    }
    const _allAncestors = node => {
        if (node) {
            return [node, ..._allAncestors(node.parentNode)]
        }
        return [];
    };
    const _findCommonAncestor = (node1, node2) => {
        const ancestors1 = _allAncestors(node1);
        var n = node2;
        while (n && !ancestors1.includes(n)) {
            n = n.parentNode;
        }
        console.log(`common ancestor of selected nodes:`);
        console.log(n);
        return n;
    }
    const _hasAncestor = (node, anc) => {
        if (!node) return false;
        if (node === anc) return true;
        return _hasAncestor(node.parentNode, anc);
    }
    const _hasAnyAncestor = (node, potentialAncestors) => {
        for (let i = 0; i < potentialAncestors.length; i++) {
            if (_hasAncestor(node, potentialAncestors[i])) {
                return true;
            }
        }
        return false;
    }
    const _isSibling = (node1, node2) => node1.parentNode === node2.parentNode;
    const _constructSelectionElement = (startNode, anc1, anc2, selectionObj, includedNodes = []) => {
        const { anchorNode, anchorOffset, extentNode, extentOffset } = selectionObj;
        if (anc1.includes(startNode) || anc2.includes(startNode) || _hasAnyAncestor(startNode, includedNodes)) {
            if (startNode instanceof Text) {
                let text = startNode.nodeValue;
                let startIndex = startNode === anchorNode ? anchorOffset : 0;
                let endIndex = startNode === extentNode ? extentOffset : text.length;
                let tnode = document.createTextNode(text.substring(startIndex, endIndex));
                return tnode;
            }
            const elem = document.createElement(startNode.tagName);
            if (startNode.className) {
                elem.className = startNode.className;
            }
            if (startNode.hasChildNodes()) {
                const cnodes = startNode.childNodes;
                const startIndex = startNode === anchorNode ? anchorOffset : 0;
                const endIndex = startNode === extentNode ? extentOffset : cnodes.length;
                for (let i = startIndex; i < endIndex; i++) {
                    let cnode = cnodes[i];
                    let snode = _constructSelectionElement(cnode, anc1, anc2, selectionObj, includedNodes.concat([startNode]));
                    if (snode) {
                        elem.appendChild(snode);
                    }
                }
            }
            return elem;
        } else {
            console.log('skipping this node:'); console.log(startNode);
            return null;
        }
    }
    console.log('parseSelection...');
    if (!window.getSelection()) {
        return null;
    }
    const { anchorNode, extentNode } = window.getSelection();
    console.log('anchorNode:'); console.log(anchorNode);
    console.log('extentNode:'); console.log(extentNode);
    const startNode = _findCommonAncestor(anchorNode, extentNode);
    const selElem = document.createElement('span');
    selElem.appendChild(_constructSelectionElement(startNode, _allAncestors(anchorNode), _allAncestors(extentNode), window.getSelection()));
    console.log('constructed selection node:');
    console.log(selElem);
    const parsed = parseFormula(selElem);
    console.log(`parsed: ${parsed}`);
    return parsed;
}

const tryEval = str => {
    let res = `could not evaluate \"${str}\"`;
    try {
        res = `${str} = ${eval(str)}`;
    } catch (err) {
        res += '\n' + err;
    }
    return res;
}

const remoteEval = (str, callback) => {
    chrome.tabs.executeScript({
        code: `(${tryEval})("${str}")`
    }, ([res] = []) => {
        callback.call(null, res);
    });
}

const getSelectedTextFromWebpage = callback => {
    chrome.tabs.executeScript({
        code: 'window.getSelection().toString()'
    }, ([res] = []) => {
        console.log(`text selection: ${res}`);
        if (typeof callback === 'function') {
            callback(res);
        }
    })
}

const parseSelectionFromWebpage = callback => {
    chrome.tabs.executeScript({
        code: `(${remoteParseSelection})()`
    }, ([res] = []) => {
        console.log(res);
        if (typeof callback === 'function') {
            callback(res);
        }
    })
}