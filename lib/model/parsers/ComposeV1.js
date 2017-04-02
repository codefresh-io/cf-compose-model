'use strict';

const _               = require('lodash');
const CFComposeModel  = require('./../CFComposeModel');
const Promise         = require('bluebird'); // jshint ignore:line
const ServiceV1Parser = require('./ComposeV1/Service');
const SyntaxError    = require('./../errorsAndWarnings/Errors/SyntaxError'); // jshint ignore:line
class ComposeV1 {
    static parse(yaml, policy) {
        let errors    = [];
        const compose = new CFComposeModel(yaml);
        if (policy) {
            compose.setPolicy(policy);
        }
        const serviceKeys   = _.keys(yaml);
        const accessibility = compose.getServicesAccessibility();
        return Promise.map(serviceKeys, (serviceName) => {
            const serviceObj    = yaml[serviceName];
            const serviceParser = new ServiceV1Parser(serviceName, serviceObj);
            return serviceParser.parse(accessibility)
                .then(service => {
                    compose.addService(service);
                })
                .catch(err => {
                    if (err.errors) {
                        errors = errors.concat(err.errors);
                    }
                    if (err._service) {
                        compose.addService(err._service);
                    }
                });
        })
            .then(() => {
                if (_.size(errors) > 0) {
                    const err = new SyntaxError('FAILED_TO_PARSE');
                    err.originalYaml = yaml;
                    err.errors       = errors;

                    return compose.getWarnings()
                        .then(warnings => {
                            err.warnings = warnings;
                            throw err;
                        });
                }
                return compose;
            });
    }
}

module.exports = ComposeV1;