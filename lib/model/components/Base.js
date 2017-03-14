'use strict';

const _ = require('lodash');

class BaseComponent {
    constructor(name) {
        if (!name) {
            throw new Error(`${new.target.name} must have a name`);
        }
        this._name = name;
        this.warnings = [];
    }

    getName(){
        return this._name;
    }

    toJson() {
        return _.omit(this, ['_name', 'warnings']);
    }

    get(fields){
        return _.pick(this, fields);
    }

    getWarnings(possibleViolations) {
        this.warnings = [];
        possibleViolations = possibleViolations || {};
        _.forEach(possibleViolations, (violation) => {
            const warning = this._createWarning(violation);
            if (warning) {
                this.warnings.push(warning);
            }
        });

        return this.warnings;
    }

    fixWarnings(onlyAutoFix) {
        _.forEach(this.warnings, warning => {
            if(!onlyAutoFix || (onlyAutoFix && warning.autoFix))
                this._fixWarning(warning);
        });
    }

    _fixWarning(){}



    _createWarning() {}

    static parse() {}

    setAdditionalData(name, data){
        this[name] = data;
        return this;
    }
}

module.exports = BaseComponent;