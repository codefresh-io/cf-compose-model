'use strict';

const Base    = require('./BaseComponent');

class Image extends Base {
    constructor(repository, tag) {
        super();
        this.repository = repository;
        this.tag = tag;
    }

    toString(){
        return `${this.repository}:${this.tag}`;
    }
}

module.exports = Image;