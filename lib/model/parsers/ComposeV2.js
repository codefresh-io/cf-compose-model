'use strict';

const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const components     = require('./../components');
const Service        = components.Service;
const Network        = components.Network;
const Volume         = components.Volume;
const ServiceImage   = components.ServiceImage;
const ServiceVolume  = components.ServiceVolume;


class ComposeV2 {
    static parse(yaml) {
        const compose = new CFComposeModel(yaml);

        //get all the services
        const yamlServices = _.cloneDeep(yaml.services) || {};
        _.forOwn(yamlServices, (serviceObj, serviceName) => {
            const instances = {};
            _.forOwn(serviceObj, (fieldObj, fieldName) => {
                const supportedTypes = {
                    'image': () => {
                        instances[fieldName] = new ServiceImage(fieldObj, fieldName);
                    },
                    'ports': () => {},
                    'volumes': () => {
                        const volumes = instances[fieldName] = [];
                        if (_.isArray(fieldObj)) {
                            _.forEach(fieldObj, (obj) => {
                                volumes.push(ServiceVolume.parse(obj, fieldName));
                            });
                        } else {
                            _.forEach(fieldObj, (obj) => {
                                volumes.push(ServiceVolume.parse(obj, fieldName));
                            });
                        }
                    }
                };

                if (supportedTypes[fieldName]) {
                    supportedTypes[fieldName]();
                    delete serviceObj[fieldName];
                }

            });

            const serviceInstance = new Service(serviceName, _.merge(instances, serviceObj));
            compose.addService(serviceInstance);

        });

        //get all the networks
        const yamlNetworks = _.cloneDeep(yaml.networks) || {};
        _.forOwn(yamlNetworks, (networkObj, networkName) => {
            compose.addNetwork(new Network(networkName, networkObj));
        });


        //get all the volumes
        const yamlVolumes = _.cloneDeep(yaml.volumes) || {};
        _.forOwn(yamlVolumes, (volumeObj, volumeName) => {
            compose.addVolume(new Volume(volumeName, volumeObj));
        });

        return compose;
    }
}

module.exports = ComposeV2;