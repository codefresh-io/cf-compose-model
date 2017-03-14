'use strict';

const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const components     = require('./../components');
const ServiceImage   = components.ServiceImage;
const ServicePort    = components.ServicePort;

class ComposeV1 {
    static parse(yaml) {
        const compose = new CFComposeModel(yaml);
        _.forOwn(yaml, (serviceObj, name) => {
            let leafs = {};
            _.forOwn(serviceObj, (fieldValue, fieldName) => {
                const cases = {
                    'image': () => {
                        leafs[fieldName] = new ServiceImage(fieldValue);
                    },
                    'ports': () => {
                        const ports = leafs[fieldName] = [];
                        if (_.isArray(fieldValue)) {
                            _.forEach(fieldValue, (port) => {
                                const portInstance = new ServicePort(port);
                                ports.push(portInstance);
                            });
                        } else {
                            _.forOwn(fieldValue, (port) => {
                                const portInstance = new ServicePort(port);
                                ports.push(portInstance);
                            });
                        }
                    },
                    'volumes': () => {
                        const volumes = leafs[fieldName] = [];
                        if (_.isArray(fieldValue)) {
                            _.forEach(fieldValue, (volume) => {
                                const volumeInstance = components.ServiceVolume.parse(volume);
                                volumes.push(volumeInstance);
                            });
                        } else {
                            _.forOwn(fieldValue, (volume) => {
                                const volumeInstance = components.ServiceVolume.parse(volume);
                                volumes.push(volumeInstance);
                            });
                        }
                    }
                };
                if (cases[fieldName]) {
                    cases[fieldName]();
                    delete serviceObj[fieldName];
                }
            });
            const serviceInstance = new components.Service(name, _.merge(leafs, serviceObj));
            compose.addService(serviceInstance);
        });
        return compose;
    }
}

module.exports = ComposeV1;