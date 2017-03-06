'use strict';

class BaseComponent {
    constructor() {
        this.warnings = [];
    }

    toString(){}

    getWarnings() {}

    _createWarning(){}

    fixWarnings(){}

    static parse(){}

}


module.exports = BaseComponent;