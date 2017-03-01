'use strict';

const _ = require('lodash');
const CFComposeModel = require('./../CFComposeModel');

class ComposeV1 {
    static parse(yaml) {
        const compose = new CFComposeModel(yaml);
        _.forOwn(yaml, (service, name) => {
            compose.addService(name, service);
        });
        return compose;
    }
}

module.exports = ComposeV1;