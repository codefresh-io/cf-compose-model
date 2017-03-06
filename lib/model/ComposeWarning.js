'use strict';

class ComposeWarning {
    constructor(name, actual, suggestion, message) {
        this.name               = name;
        this.actual             = actual;
        this.suggestion         = suggestion;
        this.message            = message;
        this.autoFix            = false;
        this.requireManuallyFix = false;
    }
}

module.exports = ComposeWarning;