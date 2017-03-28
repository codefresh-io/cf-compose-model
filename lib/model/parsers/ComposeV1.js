'use strict';

const _                                 = require('lodash');
const CFComposeModel                    = require('./../CFComposeModel');
const Promise                           = require('bluebird'); // jshint ignore:line
const ServiceV1Parser                   = require('./ComposeV1/Service');

class ComposeV1 {
    static parse(yaml, policy) {
        const compose = new CFComposeModel(yaml);
        if (policy) {
            compose.setPolicy(policy);
        }
        const serviceKeys   = _.keys(yaml);
        const accessibility = compose.getServicesAccessibility();
        return Promise.map(serviceKeys, (serviceName) => {
            const serviceObj = yaml[serviceName];
            const serviceParser = new ServiceV1Parser(serviceName, serviceObj);
            return serviceParser.parse(accessibility)

        })
            .map(service => {
                compose.addService(service);
            })
            .then(() => {
                return compose;
            });
    }
}

module.exports = ComposeV1;