'use strict';

const _       = require('lodash');
const Base    = require('./BaseComponent');
const Warning = require('./../ComposeWarning');

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