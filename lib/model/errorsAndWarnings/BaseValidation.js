'use strict';

class BaseValidation {
    constructor(name, message) {
        this._name    = name;
        this._message = message;
    }

    getName() {
        return this._name;
    }

    getMessage() {
        return this._message;
    }

    format(){
        throw new Error('Not implemented');
    }
}

module.exports = BaseValidation;