'use strict';

const Base = require('./BaseComponent');

class Label extends Base {
    constructor(key, value) {
        super();
        this.key   = key;
        this.value = value;
    }

    toString(){
        return `${this.key}=${this.value}`;
    }
}

module.exports = Label;