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
const InvalidSyntexForParser    = require('./errorsAndWarnings/Errors/InvalidSyntexForParser');
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

    setupPredefinedVolumes(volumes) {
        this._allowedVolumesSources = volumes;
    }

    getAllowedVolumesSources() {
        return this._allowedVolumesSources;
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

    parseService(name, obj) {
        const parsers       = CFComposeModel.getParsersForYaml(this.originalYaml);
        const ServiceParser = parsers.ServiceParser;
        const parser        = new ServiceParser(name, obj);
        return parser.parse(this.getServicesAccessibility());
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
        if (volume instanceof InvalidSyntexForParser) {
            this.volumes.data[volume.getFieldName()] = volume;
            this.volumes._order.push(volume.getFieldName());
        } else {
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
    }

    translate(Translator, opt) {
        if (Translator) {
            return new Translator(this, opt);
        }
        if (!this.defaultTranslator) {
            throw new Error('Default translator not exist');
        }
        return new this.defaultTranslator(this, opt);
    }

    getWarnings() {
        let res           = [];
        const services    = this.getAllServices();
        const volumeName  = _.keys(this.getAllVolumes());
        const serviceKeys = Object.keys(services);
        return Promise.resolve()
            .then(() => {
                return Promise.map(serviceKeys, (serviceName) => {
                    return this.getServiceByName(serviceName)
                        .getWarnings(this.getServicesAccessibility(),
                            {
                                allowedVolumes: this.getAllowedVolumesSources(),
                                globalVolumeWithLocalDriver: volumeName
                            })
                        .then(warnings => {
                            res = res.concat(warnings);
                            return;
                        });
                });
            })
            .then(() => {
                const volumes                  = this.getAllVolumes();
                const accessibility            = this.getVolumesAccessibility();
                const isExternalVolumesAllowed = accessibility.isExternalVolumeAllowed();
                const isLocalDriverAllowed     = accessibility.isLocalDriverAllowed();
                const volumeKeys               = Object.keys(volumes);
                if (!accessibility.isGlobalVolumeAllowed()) {
                    return Promise.map(volumeKeys, volumeName => {
                        const volume = this.getVolumeByName(volumeName);
                        if (volume instanceof Volume) {
                            if (volume.isExternalVolume() && isExternalVolumesAllowed) {
                                return;
                            } else if (volume.isExternalVolume() && !isExternalVolumesAllowed) {
                                const message       = `Warning at: volumes.${volumeName}`;
                                const suggestion    = `Try using allowed sources`;
                                const warning       = new FieldNotSupportedByPolicy(volumeName, volumes[volumeName], suggestion, message, false, true);
                                warning.readable    =
                                    `${warning.getMessage()}. The value ${warning.getData()} is not supported. ${warning.getSuggestion()}`;
                                warning.displayName = 'volumes';
                                res.push(warning);
                                return;
                            }

                            if (volume.isUsingLocalDriver() && isLocalDriverAllowed) {
                                return;
                            } else if (volume.isUsingLocalDriver() && !isLocalDriverAllowed) {
                                const message       = `Warning at: volumes.${volumeName}`;
                                const suggestion    = `Try using allowed sources`;
                                const warning       = new FieldNotSupportedByPolicy(volumeName, volumes[volumeName], suggestion, message, false, true);
                                warning.readable    =
                                    `${warning.getMessage()}. The value ${warning.getData()} is not supported. ${warning.getSuggestion()}`;
                                warning.displayName = 'volumes';
                                res.push(warning);
                                return;
                            } else if (!volume.isUsingLocalDriver()) {
                                const message       = `Warning at: volumes.${volumeName}`;
                                const suggestion    = `driver: local`;
                                const warning       = new FieldNotSupportedByPolicy(volumeName, volumes[volumeName], suggestion, message, false, true);
                                warning.readable    =
                                    `${warning.getMessage()}. The value ${warning.getData()} is not supported. ${warning.getSuggestion()}`;
                                warning.displayName = 'volumes';
                                res.push(warning);
                                return;
                            }

                            const suggestion    = 'Avoid using global volumes';
                            const message       = `Warning at: volumes.${volumeName}`;
                            const warning       = new FieldNotSupportedByPolicy(volumeName, volumes[volumeName], suggestion, message, false, true);
                            warning.readable    =
                                `${warning.getMessage()}. The value ${warning.getData()} is not supported. ${warning.getSuggestion()}`;
                            warning.displayName = 'volumes';
                            res.push(warning);
                        }
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
                return this.mapOverVolumes((volumeName, volumeInstance) => {
                    if (volumeInstance instanceof InvalidSyntexForParser) {
                        res.push(volumeInstance);
                    }
                });
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
            return service.getImage().getName();
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

    static getParserForYaml(yamlObj) {
        const parsers = CFComposeModel.getParsersForYaml(yamlObj);
        if (parsers.Parser) {
            return parsers.Parser;
        }
        return parsers;
    }

    static getTranslatorForYaml(yamlObj) {
        //avoid circular dep
        const translators = require('./translators');
        if (!yamlObj) {
            throw new Error('Yaml not supplied');
        } else if (!yamlObj.version) {
            return translators.ComposeV1;
        } else if (yamlObj.version === '2' || yamlObj.version === '2.0') {
            return translators.ComposeV2;
        } else if (yamlObj.version === '3' || yamlObj.version === '3.0') {
            return translators.ComposeV3;
        } else {
            throw new Error('Translator not found');
        }
    }

    static getParsersForYaml(yamlObj) {
        //avoid circular dep
        const parsers = require('./parsers');
        if (!yamlObj) {
            return new ComposeError('YAML_NOT_SUPPLIED', yamlObj, 'yaml file cannot be parssed');
        } else if (!yamlObj.version) {
            return parsers.ComposeV1;
        } else if (yamlObj.version === '2' || yamlObj.version === '2.0') {
            return parsers.ComposeV2;
        } else if (yamlObj.version === '3' || yamlObj.version === '3.0') {
            return parsers.ComposeV3;
        } else {
            return new ComposeError('NOT_SUPPORTED_YAML', yamlObj);
        }
    }

}

module.exports = CFComposeModel;
