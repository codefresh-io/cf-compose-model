'use strict';

const Base = require('./BaseComponent');

class Label extends Base {
    constructor(key, value) {
        super();
        this.key   = key;
        this.value = value;
        delete this.warnings;
    }

    toString(){
        return `${this.key}=${this.value}`;
    }


    static parse(label){
        const kv    = label.split('=');
        const key   = kv[0];
        const value = kv[1];
        return new Label(key, value);
    }
}

module.exports = Label;