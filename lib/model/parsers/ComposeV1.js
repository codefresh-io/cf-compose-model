'use strict';

const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const components     = require('./../components');
const ServiceImage   = components.ServiceImage;
const ServicePort    = components.ServicePort;
const ServiceVolume  = components.ServiceVolume;

class ComposeV1 {
    static parse(yaml) {
        const compose = new CFComposeModel(yaml);
        _.forOwn(yaml, (serviceObj, name) => {
            const serviceInstance = new components.Service(name);
            _.forOwn(serviceObj, (fieldValue, fieldName) => {
                const cases = {
                    'image': () => {
                        serviceInstance.setImage(fieldValue);
                    },
                    'ports': () => {
                        if (_.isArray(fieldValue)) {
                            _.forEach(fieldValue, (port) => {
                                serviceInstance.addPort(port);
                            });
                        } else {
                            _.forOwn(fieldValue, (port) => {
                                serviceInstance.addPort(port);
                            });
                        }
                    },
                    'volumes': () => {
                        if (_.isArray(fieldValue)) {
                            _.forEach(fieldValue, (volume) => {
                                serviceInstance.addVolume(volume);
                            });
                        } else {
                            _.forOwn(fieldValue, (volume) => {
                                serviceInstance.addVolume(volume);
                            });
                        }
                    }
                };

                if (cases[fieldName]) {
                    cases[fieldName]();
                } else {
                    serviceInstance.setAdditionalData(fieldName, fieldValue);
                }
            });
            compose.addService(serviceInstance);
        });
        return compose;
    }
}

module.exports = ComposeV1;