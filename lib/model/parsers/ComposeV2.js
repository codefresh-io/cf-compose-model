'use strict';

const _                         = require('lodash');
const CFComposeModel            = require('./../CFComposeModel');
const Promise                   = require('bluebird'); // jshint ignore:line
const ServiceV2Parser           = require('./ComposeV2/Service');
const VolumeV2Parser            = require('./ComposeV2/Volume');
const NetworkV2Parser           = require('./ComposeV2/Network');

class ComposeV2 {
    static parse(yaml, policy) {
        const compose = new CFComposeModel(yaml);
        if (policy) {
            compose.setPolicy(policy);
        }
        //get all the services
        const accessibility = compose.getServicesAccessibility();
        const yamlServices  = yaml.services || {};
        const yamlNetworks  = yaml.networks || {};
        const yamlVolumes   = yaml.volumes || {};

        const yamlServicesKeys = _.keys(yamlServices);
        const yamlNetworksKeys = _.keys(yamlNetworks);
        const yamlVolumesKeys  = _.keys(yamlVolumes);


        return Promise.map(yamlServicesKeys, (serviceName) => {
            const serviceParser = new ServiceV2Parser(serviceName, yamlServices[serviceName]);
            return serviceParser.parse(accessibility);
        })
            .map((service) => {
                compose.addService(service);
            })
            .then(() => {
                return Promise.map(yamlNetworksKeys, (networkName) => {
                    const networkParser = new NetworkV2Parser(networkName, yamlNetworks[networkName]);
                    return networkParser.parse(accessibility);
                })
                    .map((network) => {
                        compose.addNetwork(network);
                    });
            })
            .then(() => {
                return Promise.map(yamlVolumesKeys, (volumeName) => {
                    const volumeParser = new VolumeV2Parser(volumeName, yamlVolumes[volumeName]);
                    return volumeParser.parse(accessibility);
                })
                    .map((volume) => {
                        compose.addVolume(volume);
                    });
            })
            .then(() => {
                return compose;
            });

    }
}

module.exports = ComposeV2;