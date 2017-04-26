'use strict';

const Promise = require('bluebird'); // jshint ignore:line

class BaseStep {
    constructor(type, stepName, stepObject) {
        if (!type) {
            throw new Error('Step must have type');
        }
        this._type     = type;
        this._name     = stepName;
        this._stepData = stepObject;
    }

    getType() {
        return this._type;
    }

    getName(){
        return this._name;
    }

    exec() {
        throw new Error('Not implemented');
    }

    formatAllWarnings(unformatted) {
        return Promise.map(unformatted, (warning) => { return warning.format(); });
    }


    throwError(string) {
        console.log(string.red);
    }

}

module.exports = BaseStep;