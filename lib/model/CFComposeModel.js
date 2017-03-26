'use strict';

const Promise                   = require('bluebird'); // jshint ignore:line
const fs                        = require('fs');
const components                = require('./components');
const ParsingError              = require('./errorsAndWarnings/Errors/ParsingError');
const policies                  = require('./policies');
const YAML                      = require('js-yaml');
const _                         = require('lodash');
const BasePolicy                = require('./policies/Base');
const accessibility             = require('./accessibility');
const Service                   = components.Service;
const Network                   = components.Network;
const Volume                    = components.Volume;
const ServiceAccessibility      = accessibility.ServiceAccessibility;
const NetworkAccessibility      = accessibility.NetworkAccessibility;
const VolumeAccessibility       = accessibility.VolumeAccessibility;
const FieldNotSupportedByPolicy = require('./errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');
const ComposeError              = require('./errorsAndWarnings/Errors/Error');

class CFComposeModel {
    constructor(originalYaml) {
        this.originalYaml = originalYaml;
        if (originalYaml) {
            this.parser            = CFComposeModel.getParserForYaml(this.originalYaml);
            this.defaultTranslator = CFComposeModel.getTranslatorForYaml(this.originalYaml);
        }
        this.services     = {
            data: {},
            _order: []
        };
        this.volumes      = {
            data: {},
            _order: []
        };
        this.networks     = {
            data: {},
            _order: []
        };
        this.policy       = policies.shared;
        this.accessiblity = {
            services: new ServiceAccessibility(),
            networks: new NetworkAccessibility(),
            volumes: new VolumeAccessibility()
        };
        this._order       = [];
    }

    _mapOver(field, cb) {
        if (!this[field]) {
            throw new Error(`Property not exist ${field}`);
        }
        const object = this[field].data;
        if (!object) {
            throw new Error(`${field} not supported to be mapped`);
        }
        const keys = _.keys(object);
        return Promise.map(keys, (key) => {
            const value = object[key];
            return cb(key, value);
        });
    }

    getServicesAccessibility() {
        return _.get(this, 'accessiblity.services', {});
    }

    getVolumesAccessibility() {
        return _.get(this, 'accessiblity.volumes', {});
    }

    allowPortMapping() {
        this.accessiblity.services.allowPortMapping();
    }

    allowServiceVolumeMapping() {
        this.accessiblity.services.allowVolumeMapping();
    }

    allowGlobalVolumeUsage() {
        this.accessiblity.volumes.allowGlobalVolumeUsage();
    }

    disallowPortMapping() {
        this.accessiblity.services.disallowPortMapping();
    }

    disallowServiceVolumeMapping() {
        this.accessiblity.services.disallowVolumeMapping();
    }

    disallowGlobalVolumeUsage() {
        this.accessiblity.volumes.disallowGlobalVolumeUsage();
    }

    getAllServices() {
        return this.services.data;
    }

    getAllVolumes() {
        return this.volumes.data;
    }

    getAllNetworks() {
        return this.networks.data;
    }

    setPolicy(policy) {
        if (!(policy instanceof BasePolicy)) {
            throw new Error('Not policy given');
        }
        policies.shared.activate(this);
        policy.activate(this);
    }

    addService(service) {
        if (!(service instanceof Service)) {
            throw new Error('Not an instanceof Service');
        }

        const name = service.getName();
        if (this.services.data[name]) {
            throw new Error('Cant add service with the same name');
        }
        this.services.data[name] = service;
        this.services._order.push(name);
    }

    addNetwork(network) {
        if (!(network instanceof Network)) {
            throw new Error('Not an instanceof Network');
        }
        const name = network.getName();
        if (this.networks.data[name]) {
            throw new Error('Cant add network with the same name');
        }

        this.networks.data[name] = network;
        this.networks._order.push(name);
    }

    addVolume(volume) {
        if (!(volume instanceof Volume)) {
            throw new Error('Not an instanceof Volume');
        }
        const name = volume.getName();
        if (this.networks.data[name]) {
            throw new Error('Cant add volume with the same name');
        }

        this.volumes.data[name] = volume;
        this.volumes._order.push(name);
    }

    translate(Translator, opt) {
        if (Translator) {
            return Translator.translate(this, opt);
        }
        if (!this.defaultTranslator) {
            throw new Error('Default translator not exist');
        }
        return this.defaultTranslator.translate(this, opt);
    }

    getWarnings() {
        let res           = [];
        const services    = this.getAllServices();
        const serviceKeys = Object.keys(services);
        return Promise.resolve()
            .then(() => {
                return Promise.map(serviceKeys, (serviceName) => {
                    return this.getServiceByName(serviceName)
                        .getWarnings(this.getServicesAccessibility())
                        .then(warnings => {
                            res = res.concat(warnings);
                            return;
                        });
                });
            })
            .then(() => {
                const volumes       = this.getAllVolumes();
                const accessibility = this.getVolumesAccessibility();
                const volumeKeys    = Object.keys(volumes);
                if (!accessibility.isGlobalVolumeAllowed()) {
                    return Promise.map(volumeKeys, volumeName => {
                        const volume     = this.getVolumeByName(volumeName);
                        const warning    = new FieldNotSupportedByPolicy(volumeName, volumes[volumeName], 'Avoid using global volumes', 'Warning at: volumes.redis-data', this.getServiceByName(
                            volume.getName()), false, true);
                        warning.readable =
                            `${warning.getMessage()}. The value ${warning.getData()} is not supported. ${warning.getSuggestion()}`;
                        res.push(warning);
                    });
                } else {
                    return [];
                }
            })
            .then(() => {
                return res;
            });
    }

    getErrors() {
        const serviceKeys = this.getServicesOrder();
        let res           = [];
        return Promise.map(serviceKeys, (name) => {
            return this.getServiceByName(name)
                .getErrors()
                .then(errors => {
                    res = res.concat(errors);
                });
        })
            .then(() => {
                const networksKeys = this.getNetworksOrder();
                if (networksKeys.length > 0) {
                    return Promise.map(networksKeys, (networkName) => {
                        return this.getNetworkByName(networkName)
                            .getErrors()
                            .then(errors => {
                                res = res.concat(errors);
                            });
                    });
                }
                return;
            })
            .then(() => {
                const volumesKeys = this.getVolumesOrder();
                if (volumesKeys.length > 0) {
                    return Promise.map(volumesKeys, (volumeName) => {
                        return this.getVolumeByName(volumeName)
                            .getErrors()
                            .then(errors => {
                                res = res.concat(errors);
                            });
                    });
                }
                return;
            })
            .then(() => {
                return res;
            });
    }

    fixWarnings(onlyAutoFix = false) {
        return this.getWarnings()
            .then(() => {
                return _.forOwn(this.getAllServices(), (service) => {
                    service.fixWarnings(onlyAutoFix);
                });
            });
    }

    getServiceByName(name) {
        const allServices = this.getAllServices();
        if (allServices[name]) {
            return allServices[name];
        }
        return;
    }

    getVolumeByName(name) {
        const allVolumes = this.getAllVolumes();
        if (allVolumes[name]) {
            return allVolumes[name];
        }
        return;
    }

    getNetworkByName(name) {
        const allNetworks = this.getAllNetworks();
        if (allNetworks[name]) {
            return allNetworks[name];
        }
        return;
    }

    getErrorsAndWarnings() {
        const res = {};
        return this.getWarnings()
            .then((warnings) => {
                res['warnings'] = warnings;
            })
            .then(this.getErrors.bind(this))
            .then(errors => {
                res['errors'] = errors;
            })
            .then(() => {
                return res;
            });
    }

    /**
     * Set the order of services, networks, volumes
     * @param array
     */
    setGlobalOrder(array) {
        this._order = array;
    }

    getServicesOrder() {
        const order = _.get(this, 'services._order');
        if (!order.length) {
            return Object.keys(this.getAllServices());
        }
        return order;
    }

    getNetworksOrder() {
        const order = _.get(this, 'networks._order');
        if (!order.length) {
            return Object.keys(this.getAllNetworks());
        }
        return order;
    }

    getVolumesOrder() {
        const order = _.get(this, 'volumes._order');
        if (!order.length) {
            return Object.keys(this.getAllVolumes());
        }
        return order;
    }

    mapOverServices(cb) {
        return this._mapOver('services', cb);
    }

    mapOverNetworks(cb) {
        return this._mapOver('networks', cb);
    }

    mapOverVolumes(cb) {
        return this._mapOver('volumes', cb);
    }

    replaceServiceWith(service) {
        if (!(service instanceof Service)) {
            throw new Error('Not an instanceof Service');
        }
        if (!this.getAllServices()[service.getName()]) {
            throw new Error(`Service ${service.getName()} not exist`);
        }

        this.services.data[service.getName()] = service;
    }

    getImageNames() {
        return Promise.map(this.getServicesOrder(), (name) => {
            const service = this.getServiceByName(name);
            return service.getImage().getImageStandardName();
        });
    }

    renameService(oldName, newName) {
        const service = this.getServiceByName(oldName);
        if (!service) {
            throw new Error(`${oldName} not found`);
        }
        service.changeName(newName);
        this.services.data[newName] = service;
        delete this.services.data[oldName];
        const index                 = _.indexOf(this.getServicesOrder(), oldName);
        this.services._order[index] = newName;
    }

    replaceVariables(regex, newValue) {
        return this.translate()
            .then(translated => {
                const newString = translated.replace(regex, newValue);
                return CFComposeModel.parse(newString);
            });

    }

    static parse(yaml, policy) {
        if (_.isString(yaml)) {
            try {
                yaml = YAML.safeLoad(yaml);
            } catch (err) {
                return Promise.reject(new ParsingError(yaml, err.message).format());
            }
        }

        if (!policy) {
            policy = policies.shared;
        }
        const Parser = CFComposeModel.getParserForYaml(yaml);
        return Parser.parse(yaml, policy);
    }

    static load(location, policy) {
        const yamlString = fs.readFileSync(location, 'utf8');
        return CFComposeModel.parse(yamlString, policy);
    }

    static getParserForYaml(yaml) {
        //avoid circular dep
        const parsers = require('./parsers');
        if (!yaml) {
            return new ComposeError('YAML_NOT_SUPPLIED', yaml, 'yaml file cannot be parssed');
        } else if (!yaml.version) {
            return parsers.ComposeV1;
        } else if (yaml.version === '2' || yaml.version === '2.0') {
            return parsers.ComposeV2;
        } else if (yaml.version === '3' || yaml.version === '3.0') {
            return parsers.ComposeV2;
        } else {
            return new ComposeError('NOT_SUPPORTED_YAML', yaml);
        }
    }

    static getTranslatorForYaml(yaml) {
        //avoid circular dep
        const translators = require('./translators');
        if (!yaml) {
            throw new Error('Yaml not supplied');
        } else if (!yaml.version) {
            return translators.ComposeV1;
        } else if (yaml.version === '2') {
            return translators.ComposeV2;
        } else if (yaml.version === '3' || yaml.version === '3.0') {
            return translators.ComposeV2;
        } else {
            throw new Error('Translator not found');
        }
    }

}

module.exports = CFComposeModel;