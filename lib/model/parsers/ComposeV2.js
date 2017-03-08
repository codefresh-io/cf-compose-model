'use strict';

const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const components     = require('./../components');
const nodes          = components.nodes;
const leafs          = components.leafs;
const Service        = nodes.Service;
const Network        = nodes.Network;
const VolumeNode     = nodes.Volume;
const Image          = leafs.Image;
const Port           = leafs.Port;
const Volume         = leafs.Volume;


class ComposeV2 {
    static parse(yaml) {
        const compose = new CFComposeModel(yaml);

        //get all the services
        const yamlServices = yaml.services || {};
        _.forOwn(yamlServices, (serviceObj, serviceName) => {
            const instances = {};
            _.forOwn(serviceObj, (fieldObj, fieldName) => {
                const supportedTypes = {
                    'image': () => {
                        instances[fieldName] = Image.parse(fieldObj, fieldName);
                    },
                    'ports': () => {},
                    'volumes': () => {
                        const volumes = instances[fieldName] = [];
                        if (_.isArray(fieldObj)) {
                            _.forEach(fieldObj, (obj) => {
                                volumes.push(Volume.parse(obj, fieldName));
                            });
                        } else {
                            _.forEach(fieldObj, (obj) => {
                                volumes.push(Volume.parse(obj, fieldName));
                            });
                        }
                    }
                };

                if (supportedTypes[fieldName]) {
                    supportedTypes[fieldName]();
                    delete serviceObj[fieldName]
                }

            });

            const serviceInstance = new Service(serviceName, _.merge(instances, serviceObj));
            compose.addService(serviceInstance);

        });

        //get all the networks
        const yamlNetworks = yaml.networks || {};
        _.forOwn(yamlNetworks, (networkObj, networkName) => {
            compose.addNetwork(new Network(networkName, networkObj));
        });


        //get all the volumes
        const yamlVolumes = yaml.volumes || {};
        _.forOwn(yamlVolumes, (volumeObj, volumeName) => {
            compose.addVolume(new VolumeNode(volumeName, volumeObj));
        });

        return compose;
    }
}

module.exports = ComposeV2;