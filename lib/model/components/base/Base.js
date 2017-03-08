'use strict';


class BaseComponent {
    constructor() {
        this.warnings = [];
    }

    getWarnings() {}

    _createWarning() {}

    static parse() {}
}

module.exports = BaseComponent;