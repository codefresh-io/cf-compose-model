'use strict';

const _                      = require('lodash');
const CFComposeModel         = require('./../CFComposeModel');
const Promise                = require('bluebird'); // jshint ignore:line
const NewServiceParser       = require('./ComposeV1/Service');
const ParsingComposeError    = require('./../cm-errors').ParsingComposeError;
const BaseParser             = require('./Base');
const InvalidSyntexForParser = require('./../errorsAndWarnings/Errors/InvalidSyntexForParser');


class ComposeV1 extends BaseParser {
    static parse(yaml, policy) {
        let errors    = [];
        const compose = new CFComposeModel(yaml);
        if (policy) {
            compose.setPolicy(policy);
        }
        const serviceKeys   = _.keys(yaml);
        const accessibility = compose.getServicesAccessibility();
        return Promise.map(serviceKeys, (serviceName) => {
            if (!ComposeV1.isServiceNameValid(serviceName)) {
                errors.push(new InvalidSyntexForParser(serviceName, serviceName, `Service name ${serviceName} is not valid`));
                return;
            }
            else {
                const serviceObj = yaml[serviceName];
                const parser     = new NewServiceParser(serviceName, serviceObj);
                parser.setAccessibility(accessibility);
                return parser.parse()
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
            }
        })
            .then(() => {
                if (_.size(errors) > 0) {
                    const er = new ParsingComposeError(yaml);
                    er.addErrorsSet(errors);

                    return compose.getWarnings()
                        .then(warnings => {
                            er.addWarningsSet(warnings);
                            throw er;
                        });
                }
                return compose;
            });
    }
}

module.exports = ComposeV1;