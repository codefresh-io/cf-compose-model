'use strict'

const Base = require('./Base');
class ErrorComponent extends Base{
    constructor(name, data, message){
        super(name);
        this._data = data;
        this._message = message;
        delete this.warnings;
    }

    getErrorMessage(){
        return this._message;
    }

    getData(){
        return this._data;
    }

    formatError(){}
}

module.exports = ErrorComponent;