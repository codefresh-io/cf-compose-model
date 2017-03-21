'use strict';

const _       = require('lodash');
const Promise = require('bluebird'); // jshint ignore:line

class BaseComponent {
    constructor(name) {
        if (!name) {
            throw new Error(`${new.target.name} must have a name`);
        }
        this._name    = name;
        this.warnings = [];
    }

    getName() {
        return this._name;
    }


    get(fields) {
        const res = _.pick(this, fields);
        return res;
    }

    fixWarnings(onlyAutoFix) {
        _.forEach(this.warnings, warning => {
            if (!onlyAutoFix || (onlyAutoFix && warning.autoFix)) {
                this._fixWarning(warning);
            }
        });
    }

    _fixWarning() {}

    getErrors() {
        return Promise.resolve([]);
    }

    _createWarning() {}

    setAdditionalData(name, data) {
        this[name] = data;
        return this;
    }
}

module.exports = BaseComponent;