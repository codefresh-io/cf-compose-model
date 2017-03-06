'use strict';

const _ = require('lodash');

class BaseComponent {
    constructor() {
        this.warnings = [];
    }

    getWarnings() {}

    _createWarning(){}

    fixWarnings(){}

}


module.exports = BaseComponent;