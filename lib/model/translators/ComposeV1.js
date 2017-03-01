'use strict';

const _              = require('lodash');
const ComposeWarning = require('./../ComposeWarning');

class ComposeV1 {
    static translate(compose) {
        let json = {};

        const service = compose.services;
        _.forOwn(service, (service, name) => {
            json[name] = {};
            _.forOwn(service, (value, key) => {
                json[name][key] = value
            });
        });
        return json;
    }

    static getWarningsForService(serviceName, serviceObj, policy) {
        const res = [];
        _.forOwn(serviceObj, (serviceProperty, propertyName) => {
            if(policy[propertyName]) {
                if (_.isArray(serviceProperty)) {
                    _.forEach(serviceProperty, (value) => {

                        _.forEach(policy[propertyName], (validation) => {
                            if(ComposeV1.isPolicyValidation(propertyName, validation.name, value)){
                                res.push(ComposeV1.createWarningForValidation(serviceName, propertyName, value, validation.name));
                            }
                        });

                    });
                } else {

                }
            }

        });

        return res;
    }

    static isPolicyValidation(name, validation, prop) {
        const cases = {
            ports: {
                INTRUSIVE: ComposeV1.isIntrusivePortMapping
            }
        };

        if(cases[name]){
            return cases[name][validation](prop);
        }
        return false;
    }

    static isIntrusivePortMapping(portStr) {
        if (_.isString(portStr)) {
            const ports = portStr.split(':');
            if(ports.length > 1){
                return true;
            }
            return false;
        }
        return false;
    }

    static createWarningForValidation(parentServiceName, fieldName, fieldCurrentValue, policyValidationName){
        const cases = {
            ports: () => {
                return new ComposeWarning(policyValidationName, fieldCurrentValue, `${fieldCurrentValue.split(':')[1]}` , `Validation: ${policyValidationName} found at ${parentServiceName}.${fieldName}`)
            }
        };
        if(cases[fieldName]){
            return cases[fieldName]();
        }
    }
}

module.exports = ComposeV1;