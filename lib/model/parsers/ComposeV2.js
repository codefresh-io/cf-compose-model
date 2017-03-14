'use strict';

const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const components     = require('./../components');
const Service        = components.Service;
const Network        = components.Network;
const Volume         = components.Volume;

class ComposeV2 {
    static parse(yaml) {
        const compose = new CFComposeModel(yaml);

        //get all the services
        const yamlServices = yaml.services || {};
        _.forOwn(yamlServices, (serviceObj, serviceName) => {
            const serviceInstance = new Service(serviceName);
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

        //get all the networks
        const yamlNetworks = yaml.networks || {};
        _.forOwn(yamlNetworks, (networkObj, networkName) => {
            const networkInstance = new Network(networkName);
            _.forOwn(networkObj, (fieldValue, fieldName) => {
                networkInstance.setAdditionalData(fieldName, fieldValue);
            });
            compose.addNetwork(networkInstance);
        });

        //get all the volumes
        const yamlVolumes = yaml.volumes || {};
        _.forOwn(yamlVolumes, (volumeObj, volumeName) => {
            const volumeInstance = new Volume(volumeName);
            _.forOwn(volumeObj, (fieldValue, fieldName) => {
                volumeInstance.setAdditionalData(fieldName, fieldValue);
            });
            compose.addVolume(volumeInstance);
        });

        return compose;
    }
}

module.exports = ComposeV2;