'use strict';

const Promise              = require('bluebird'); // jshint ignore:line
const fs                   = require('fs');
const components           = require('./components');
const policies             = require('./policies');
const YAML                 = require('yamljs');
const yaml                 = require('js-yaml');
const _                    = require('lodash');
const Service              = components.Service;
const Network              = components.Network;
const Volume               = components.Volume;
const Warning              = require('./ComposeWarning');
const BasePolicy           = require('./policies/Base');
const accessibility        = require('./accessibility');
const ServiceAccessibility = accessibility.ServiceAccessibility;
const NetworkAccessibility = accessibility.NetworkAccessibility;
const VolumeAccessibility  = accessibility.VolumeAccessibility;

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

    _getServicesAccessibility() {
        return _.get(this, 'accessiblity.services', {});
    }

    _getVolumesAccessibility() {
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
                        .getWarnings(this._getServicesAccessibility())
                        .then(warnings => {
                            res = res.concat(warnings);
                            return;
                        });
                });
            })
            .then(() => {
                const volumes       = this.getAllVolumes();
                const accessibility = this._getVolumesAccessibility();
                const volumeKeys    = Object.keys(volumes);
                if (!accessibility.isGlobalVolumeAllowed()) {
                    return Promise.map(volumeKeys, volumeName => {
                        const volume  = this.getVolumeByName(volumeName);
                        const warning = new Warning('GLOBAL_VOLUMES_NOT_SUPPORTED', volume.getName(), 'Avoid using global volumes', `Warning at: volumes.${volume.getName()}`);
                        warning.readable = `${warning.getMessage()}. The value ${warning.getActualData()} is not supported. ${warning.getSuggestion()}`;
                        res.push(warning);
                    });
                } else {
                    return [];
                }
            })
            .then(() => {
                return res;
            });

        //
        // const volumes       = this.getAllVolumes();
        // const accessibility = this._getVolumesAccessibility();
        // if (!accessibility.isGlobalVolumeAllowed()) {
        //     _.forOwn(volumes, volume => {
        //         const warning = new Warning('GLOBAL_VOLUMES_NOT_SUPPORTED', volume.getName(), 'Avoid using global volumes', `Warning at: volumes.${volume.getName()}`);
        //         res.push(warning);
        //     });
        //
        // }
        //
        // res = _.compact(res);
        // return res.map((warning) => {
        //     return warning.toJson();
        // });

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

    setServicesOrder(array) {
        _.set(this, 'services._order', array);
    }

    getServicesOrder() {
        const order = _.get(this, 'services._order');
        if (!order.length) {
            return Object.keys(this.getAllServices());
        }
        return order;
    }

    setNetworksOrder(array) {
        _.set(this, 'networks._order', array);
    }

    getNetworksOrder() {
        const order = _.get(this, 'networks._order');
        if (!order.length) {
            return Object.keys(this.getAllNetworks());
        }
        return order;
    }

    setVolumesOrder(array) {
        _.set(this, 'volumes._order', array);
    }

    getVolumesOrder() {
        const order = _.get(this, 'volumes._order');
        if (!order.length) {
            return Object.keys(this.getAllVolumes());
        }
        return order;
    }

    _mapOver(field, cb){
        if(!this[field]){
            throw new Error(`Property not exist ${field}`);
        }
        const object = this[field].data;
        if(!object){
            throw new Error(`${field} not supported to be mapped`);
        }
        const keys = _.keys(object);
        return Promise.map(keys, (key) => {
            const value = object[key];
            return cb(key, value);
        });
    }

    mapOverServices(cb){
        return this._mapOver('services', cb);
    }

    mapOverNetworks(cb){
        return this._mapOver('networks', cb);
    }

    mapOverVolumes(cb){
        return this._mapOver('volumes', cb);
    }

    static parse(yaml) {
        if (_.isString(yaml)) {
            try {
                yaml = YAML.parse(yaml);
            } catch (err) {
                throw new Error('Failed to parse yaml'); // TODO : refactor
            }
        }
        const Parser = CFComposeModel.getParserForYaml(yaml);
        return Parser.parse(yaml);
    }

    static load(location) {
        const yamlString = yaml.safeLoad(fs.readFileSync(location, 'utf8'));
        return CFComposeModel.parse(yamlString);
    }

    static getParserForYaml(yaml) {
        //avoid circular dep
        const parsers = require('./parsers');
        if (!yaml) {
            throw new Error('Yaml not supplied');
        } else if (!yaml.version) {
            return parsers.ComposeV1;
        } else if (yaml.version === '2' || yaml.version === '2.0') {
            return parsers.ComposeV2;
        } else if (yaml.version === '3' || yaml.version === '3.0') {
            return parsers.ComposeV2;
        } else {
            throw new Error('Parser not found');
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