'use strict';

const _                         = require('lodash');
const CFComposeModel            = require('./../CFComposeModel');
const Promise                   = require('bluebird'); // jshint ignore:line
const ServiceV2Parser           = require('./ComposeV2/Service');
const VolumeV2Parser            = require('./ComposeV2/Volume');
const NetworkV2Parser           = require('./ComposeV2/Network');
const ParsingError    = require('./../errorsAndWarnings/Errors/ParsingError');

class ComposeV2 {
    static parse(yaml, policy) {
        let errors = [];
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
            return serviceParser.parse(accessibility)
                .then(service => {
                    compose.addService(service);
                })
                .catch(err => {
                    if(err.errors){
                        errors = errors.concat(err.errors);
                        compose.addService(err._service);
                    }
                });

        })
            .then(() => {
                return Promise.map(yamlNetworksKeys, (networkName) => {
                    const networkParser = new NetworkV2Parser(networkName, yamlNetworks[networkName]);
                    return networkParser.parse(accessibility)
                        .then((network) => {
                            compose.addNetwork(network);
                        })
                        .catch(err => {
                            if(err.errors){
                                errors = errors.concat(err.errors);
                                compose.addService(err._network);
                            }
                        });
                });
            })
            .then(() => {
                return Promise.map(yamlVolumesKeys, (volumeName) => {
                    const volumeParser = new VolumeV2Parser(volumeName, yamlVolumes[volumeName]);
                    return volumeParser.parse(accessibility)
                        .then((volume) => {
                            compose.addVolume(volume);
                        })
                        .catch(err => {
                            if(err.errors){
                                errors = errors.concat(err.errors);
                                compose.addVolume(err._volume);
                            }
                        });
                });

            })
            .then(() => {
                if(_.size(errors) > 0){
                    const err = new ParsingError('FAILED_TO_PARSE');
                    err.errors = errors;
                    err.originalYaml = yaml;
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

module.exports = ComposeV2;