'use strict';

const _                      = require('lodash');
const CFComposeModel         = require('./../CFComposeModel');
const Promise                = require('bluebird'); // jshint ignore:line
const VolumeV2Parser         = require('./ComposeV2/Volume');
const NetworkV2Parser        = require('./ComposeV2/Network');
const InvalidSyntexForParser = require('./../errorsAndWarnings/Errors/InvalidSyntexForParser');
const NewServiceParser       = require('./ComposeV3/Service');
const ParsingComposeError    = require('./../cm-errors').ParsingComposeError;
const BaseParser             = require('./Base');

class ComposeV3 extends BaseParser {
    static parse(yaml, policy) {
        let errors    = [];
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

        const unsupportedKeys = _.omit(yaml, ['version', 'services', 'networks', 'volumes']);


        return Promise.map(yamlServicesKeys, (serviceName) => {
            if (!ComposeV3.isServiceNameValid(serviceName)) {
                errors.push(new InvalidSyntexForParser(serviceName, serviceName, `Service name ${serviceName} is not valid`));
                return;
            } else {
                const serviceObj = yamlServices[serviceName];
                const parser     = new NewServiceParser(serviceName, serviceObj);
                parser.setAccessibility(accessibility);
                return parser.parse()
                    .then(service => {
                        compose.addService(service);
                    })
                    .catch(err => {
                        if (err.errors) {
                            errors = errors.concat(err.errors);
                            compose.addService(err._service);
                        }
                    });
            }
        })
            .then(() => {
                return Promise.map(yamlNetworksKeys, (networkName) => {
                    const networkParser = new NetworkV2Parser(networkName, yamlNetworks[networkName]);
                    return networkParser.parse(accessibility)
                        .then((network) => {
                            compose.addNetwork(network);
                        })
                        .catch(err => {
                            if (err.errors) {
                                errors = errors.concat(err.errors);
                                compose.addNetwork(err._network);
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
                            if (err.errors) {
                                errors = errors.concat(err.errors);
                                compose.addVolume(err._volume);
                            }
                        });
                });
            })
            .then(() => {
                if (_.size(unsupportedKeys) > 0) {
                    const keys = _.keys(unsupportedKeys);
                    errors     = errors.concat(keys.map(
                        key => new InvalidSyntexForParser(key, unsupportedKeys[keys], `${key} is not supported by compose`)));
                }
                if (_.size(errors) > 0) {
                    const err        = new ParsingComposeError(yaml);
                    err.addErrorsSet(errors);
                    return compose.getWarnings()
                        .then(warnings => {
                            err.addWarningsSet(warnings);
                            throw err;
                        });
                }
                return compose;
            });
    }
}

module.exports = ComposeV3;