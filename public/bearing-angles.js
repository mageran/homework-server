function bearingAngles(angleString) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        const angle = new BearingAngle(angleString);
        const table = _htmlElement('table', o, null, 'left-header-table');
        var tr = _htmlElement('tr', table);
        _htmlElement('td', tr, 'True Bearing:');
        _htmlElement('td', tr, angle.trueBearingString);
        tr = _htmlElement('tr', table);
        _htmlElement('td', tr, 'Compass Bearing:');
        _htmlElement('td', tr, angle.compassBearingString);
        const bhtml = new BearingAngleHtml(angle);
        bhtml.addCanvas(_htmlElement('div', o));
    } catch (err) {
        _addErrorElement(o, err);
    }
}