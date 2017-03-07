'use strict';

const _ = require('lodash');

class CFNode {

    constructor(name){
        if(!name){
            throw new Error(`${new.target.name} must has a name`);
        }
        this.name = name;
        this.warnings = [];
    }

    toJson() {
        return _.omit(this, ['name', 'warnings']);
    }

    getWarnings() {}

    _createWarning() {}

    fixWarnings() {}

    static parse() {}


}

module.exports = CFNode;