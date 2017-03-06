'use strict';

const Base    = require('./BaseComponent');

class EnvironmentVariable extends Base {
    constructor(key, value) {
        super();
        this.key = key;
        this.value = value;
        delete this.warnings;
    }

    toString(){
        return `${this.key}=${this.value}`;
    }

    static parse(environmentVariable){
        const kv = environmentVariable.split('=');
        return new EnvironmentVariable(kv[0], kv[1]);
    }
}

module.exports = EnvironmentVariable;