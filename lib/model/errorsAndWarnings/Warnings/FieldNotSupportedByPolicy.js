'use strict';

const Warnings = require('./Warning');

class FieldNotSupportedByPolicy extends Warnings {
    constructor(fieldName, fieldValue, suggestion, message, autoFix, requireManuallyFix) {
        super('FIELD_NOT_SUPPORTED_IN_POLICY', `${fieldName}\n${fieldValue}`, suggestion, message);
        this._fieldName  = fieldName;
        this._fieldValue = fieldValue;
        if (autoFix) {
            this.setAutoFix();
        }
        if (requireManuallyFix) {
            this.setRequireManuallyFix();
        }
    }

    getFieldName(){
        return this._fieldName;
    }

    getFieldValue(){
        return this._fieldValue;
    }
}

module.exports = FieldNotSupportedByPolicy;