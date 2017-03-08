'use strict';

class Builder {
    constructor(){}

    build(){};

    buildParent(name){
        this.parentFieldName = name;
        return this;
    }
}

module.exports = Builder;