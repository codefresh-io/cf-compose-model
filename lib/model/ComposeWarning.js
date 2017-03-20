'use strict';

const _ = require('lodash');

class ComposeWarning {
    constructor(name, actual, suggestion, message) {
        this.name               = name;
        this.actual             = actual;
        this.suggestion         = suggestion;
        this.message            = message;
        this.autoFix            = false;
        this.requireManuallyFix = false;
    }

    toJson() {
        return _.pick(this, ['name', 'actual', 'suggestion', 'message', 'autoFix', 'requireManuallyFix']);
    }

    getMessage(){
        return this.message;
    }

    getActualData(){
        return this.actual;
    }

    getSuggestion(){
        return this.suggestion;
    }
}

module.exports = ComposeWarning;