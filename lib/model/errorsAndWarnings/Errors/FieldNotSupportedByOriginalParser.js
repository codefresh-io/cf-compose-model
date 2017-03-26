'use strict';

const ValidationError = require('./Error');

const NAME = 'FIELD_NOT_SUPPORTED';
class FieldNotSupportedByOriginalParser extends ValidationError {
    constructor(fieldName, fieldValue, message) {
        super(NAME, fieldValue, message);
        this._fieldName = fieldName;
    }

    getFieldName(){
        return this._fieldName;
    }
}

module.exports = FieldNotSupportedByOriginalParser;