'use strict';

class Base {

    static isServiceNameValid(serviceName) {
        return /^[a-zA-Z0-9._-]+$/.test(serviceName);
    }
}

module.exports = Base;