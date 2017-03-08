'use strict';


class BaseComponent {
    constructor() {
        this.warnings = [];
    }

    getWarnings() {
        return [];
    }

    _createWarning() {}

    static parse() {}
}

module.exports = BaseComponent;