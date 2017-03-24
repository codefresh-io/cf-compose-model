'use strict';

const Base = require('./BaseValidation');

class Error extends Base {
    constructor(name, data, message) {
        super(name, message);
        this._data = data;
    }

    getData(){
        return this._data;
    }

    format() {
        return {
            data: this.getData(),
            name: this.getName(),
            message: this.getMessage()
        }
    }

}

module.exports = Error;