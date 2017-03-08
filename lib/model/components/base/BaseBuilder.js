'use strict';

class Builder {
    constructor() {}

    build() {}

    buildParent(name) {
        this.parent = name;
        return this;
    }
}

module.exports = Builder;