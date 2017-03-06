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

    static parse(imageString){
        let repo;
        let tag;
        const imageDetails = imageString.split(':');
        return new Image(repo, tag);
    }
}

module.exports = Image;