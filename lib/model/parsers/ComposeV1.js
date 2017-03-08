'use strict';

const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const components     = require('./../components');

class ComposeV1 {
    static parse(yaml) {
        const compose = new CFComposeModel(yaml);
        _.forOwn(yaml, (serviceObj, name) => {
            let leafs = {};
            _.forOwn(serviceObj, (fieldValue, fieldName) => {
                const cases = {
                    'image': () => {
                        leafs[fieldName] = components.leafs.Image.parse(fieldValue, fieldName);
                    },
                    'ports': () => {
                        const ports = leafs[fieldName] = [];
                        if(_.isArray(fieldValue)){
                            _.forEach(fieldValue, (port) => {
                                const portInstance = components.leafs.Port.parse(port, fieldName);
                                ports.push(portInstance);
                            });
                        } else {
                            _.forOwn(fieldValue, (port) => {
                                const portInstance = components.leafs.Port.parse(port, fieldName);
                                ports.push(portInstance);
                            });
                        }
                    },
                    'volumes': () => {
                        const volumes = leafs[fieldName] = [];
                        if(_.isArray(fieldValue)){
                            _.forEach(fieldValue, (volume) => {
                                const volumeInstance = components.leafs.Volume.parse(volume, fieldName);
                                volumes.push(volumeInstance);
                            });
                        } else {
                            _.forOwn(fieldValue, (volume) => {
                                const volumeInstance = components.leafs.Volume.parse(volume, fieldName);
                                volumes.push(volumeInstance);
                            });
                        }
                    }
                };
                if(cases[fieldName]){
                    cases[fieldName]();
                    delete serviceObj[fieldName];
                }
            });
            const serviceInstance = new components.nodes.Service(name, _.merge(leafs, serviceObj));
            compose.addService(serviceInstance);
        });
        return compose;
    }
}

module.exports = ComposeV1;