'use strict';

class ComposeWarning {
    constructor(name, actual, suggestion, message) {
        this.name      = name;
        this.actual    = actual;
        this.suggeston = suggestion;
        this.message   = message;
    }
}

module.exports = ComposeWarning;