'use strict';

const _ = require('lodash');

/**
 * Base class to wrap errors in ComposeModel
 */
class CmError extends Error {
    constructor(message) {
        super(message);
    }

    toString() {
        throw new Error('Not implemented');
    }


    getErrors() {
        return this._errors || [];
    }

    getWarnings() {
        return this._warnings || [];
    }

    addError(error) {
        this._errors = this._errors || [];
        this._errors.push(error);
    }

    addWarning(warning) {
        this._warnings = this._warnings || [];
        this._warnings.push(warning);
    }

    addWarningsSet(set) {
        if (_.isArray(set)) {
            set.map(this.addWarning.bind(this));
        }
    }

    addErrorsSet(set){
        if(_.isArray(set)){
            set.map(this.addError.bind(this));
        }
    }
}

module.exports = CmError;