'use strict';

const Base = require('./BaseValidation');

class Warning extends Base {
    constructor(name, actual, suggestion, message) {
        super(name, message);
        this._actual     = actual;
        this._suggestion = suggestion;
    }

    getData(){
        return this._actual;
    }

    getSuggestion(){
        return this._suggestion;
    }

    setAutoFix() {
        this._autoFix = true;
    }

    /**
     * Will be fixed anyway before launching
     * @return {boolean}
     */
    isAutoFix() {
        return !!this._autoFix;
    }

    setRequireManuallyFix() {
        this._requireManuallyFix = true;
    }

    /**
     * Must be fixed , otherwise cannot be launched
     * @return {boolean}
     */
    isRequireManuallyFix() {
        return !!this._requireManuallyFix;
    }

    setMessage(message){
        this._message = message;
    }

    format() {
        return {
            actual: this.getData(),
            suggestion: this.getSuggestion(),
            name: this.getName(),
            message: this.getMessage(),
            autoFix: this.isAutoFix(),
            requireManuallyFix: this.isRequireManuallyFix()
        }
    }
}

module.exports = Warning;