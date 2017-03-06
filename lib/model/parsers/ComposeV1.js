'use strict';

const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const policies       = require('./../policies');

class ComposeV1 {
    static parse(yaml) {
        const compose = new CFComposeModel(yaml);
        compose.setPolicy(policies.shared);
        _.forOwn(yaml, (service, name) => {
            compose.addService(name, service);
        });
        return compose;
    }
}

module.exports = ComposeV1;