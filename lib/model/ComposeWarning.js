'use strict';

class ComposeWarning {
    constructor(name, actual, suggestion, message) {
        this.name               = name;
        this.actual             = actual;
        this.suggestion         = suggestion;
        this.message            = message;
        this.autoFix            = false;
        this.requireManullayFix = false;
    }
}

module.exports = ComposeWarning;