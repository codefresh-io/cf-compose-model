'use strict';

const ValidationError = require('./Error');

const NAME = 'FIELD_NOT_SUPPORTED';
class InvalidSyntexForParser extends ValidationError {
    constructor(fieldName, fieldValue, message) {
        super(NAME, fieldValue, message);
        this._fieldName = fieldName;
    }

    getFieldName(){
        return this._fieldName;
    }

    format(){
        return {
            fieldName: this.getFieldName(),
            fieldData: this.getData(),
            message: this.getMessage(),
            requireManuallyFix:true
        };
    }

}

module.exports = InvalidSyntexForParser;