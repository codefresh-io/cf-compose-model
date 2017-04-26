'use strict';

const Promise                   = require('bluebird'); // jshint ignore:line
const fs                        = require('fs');
const components                = require('./components');
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
const CmErrors                  = require('./cm-errors');


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
        this.accessiblity = {
            services: new ServiceAccessibility(),
            networks: new NetworkAccessibility(),
            volumes: new VolumeAccessibility()
        };
        this.policy       = this.setPolicy(policies.shared);
    }

    /////////////Private methods///////////////    
    _mapOver(field, cb) {
        if (!this[field]) {
            return Promise.reject(new Error(`Property not exist ${field}`));
        }
        const object = _.get(this[field], 'data', []);
        const keys = _.keys(object);
        return Promise.map(keys, (key) => {
            const value = object[key];
            return cb(key, value);
        });
    }

    /////////////Policy related ///////////////

    /**
     * Set a array of name that may be used as named volumes
     * @param volumes - array
     */
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

    /**
     * @return Object that contain all the services. services-name: service-instance
     */
    getAllServices() {
        return this.services.data;
    }


    /**
     * @return Object that contain all the volumes. volumes-name: volume-instance
     */
    getAllVolumes() {
        return this.volumes.data;
    }

    /**
     * @return Object that contain all the networks. networks-name: network-instance
     */
    getAllNetworks() {
        return this.networks.data;
    }

    /**
     * Active the given polci
     */
    setPolicy(policy) {
        if (!(policy instanceof BasePolicy)) {
            throw new Error('No policy given');
        }
        policies.shared.activate(this);
        policy.activate(this);
    }

    /**
     * Can be invoked only when the ComposeModel started by load or parse.
     * Will try to create service with the same strategy that used to create the base services using the same policy
     * @param name - string
     * @param obj - object
     * @throws - the using parser may throw an errors
     * @return ComposeModelService
     */
    parseService(name, obj) {
        const parsers       = CFComposeModel.getParsersForYaml(this.originalYaml);
        const ServiceParser = parsers.ServiceParser;
        const parser        = new ServiceParser(name, obj);
        return parser.parse(this.getServicesAccessibility());
    }

    /**
     * @param service - instance of ComposeModelService
     * @throws 'Not an instanceof service' || 'Cant add service with the same name'
     */
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

    /**
     * @param network - instance of ComposeModelNetwork
     * @throws 'Not an instanceof network' || 'Cant add network with the same name'
     */
    addNetwork(network) {
        if (!(network instanceof Network)) {
            throw new Error('Not an instanceof Network');
        }
        const name = network.getName();
        if (this.getNetworkByName(name)) {
            throw new Error('Cant add network with the same name');
        }

        this.networks.data[name] = network;
        this.networks._order.push(name);
    }

    /**
     * @param volume - instance of ComposeModelVolume
     * @throws 'Not an instanceof Volume' || 'Cant add volume with the same name'
     */
    addVolume(volume) {
        if (!(volume instanceof Volume)) {
            throw new Error('Not an instanceof Volume');
        }

        const name = volume.getName();
        if (this.getVolumeByName(name)) {
            throw new Error('Cant add volume with the same name');
        }
        this.volumes.data[name] = volume;
        this.volumes._order.push(name);
    }

    /**
     * Translate the ComposeModel into default translator - the default translator is equivalent to the one that have been used to parse. If default translator not exist, must pass a translator that should be used
     * @param Translator
     * @param opt - additional data that should be passed to the translator
     * @throws - Default translator not exist (And no given translator passed)
     * @return translator output
     */
    translate(Translator, opt) {
        if (Translator) {
            return new Translator(this, opt);
        }
        if (!this.defaultTranslator) {
            throw new Error('Default translator not exist');
        }
        return new this.defaultTranslator(this, opt);
    }

    /**
     * @return all the warnings that can be found for the policy
     */
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

                            const suggestion    = 'Global volumes not supported';
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

    /**
     * Fix all the warnings that exist for the policy
     * @param onlyAutoFix - false by default. If true the warnings that will be fixed are the only warnings that have autoFix: true flag.
     * By default autoFix will be fixed as well
     * @return The warnings after the fix process done;
     */
    fixWarnings(onlyAutoFix = false) {
        return this.getWarnings()
            .then(() => {
                return _.forOwn(this.getAllServices(), (service) => {
                    service.fixWarnings(onlyAutoFix);
                });
            })
            .then(() => {
                return this.getWarnings();
            });

    }

    /**
     * @param service name
     * @return ComposeModelService instance if found, undefined otherwise
     */
    getServiceByName(name) {
        const allServices = this.getAllServices();
        if (allServices[name]) {
            return allServices[name];
        }
        return;
    }

    /**
     * @param volume name
     * @return ComposeModelVolume instance if found, undefined otherwise
     */
    getVolumeByName(name) {
        const allVolumes = this.getAllVolumes();
        if (allVolumes[name]) {
            return allVolumes[name];
        }
        return;
    }

    /**
     * @param network name
     * @return ComposeModelNetwork instance if found, undefined otherwise
     */
    getNetworkByName(name) {
        const allNetworks = this.getAllNetworks();
        if (allNetworks[name]) {
            return allNetworks[name];
        }
        return;
    }

    /**
     * @return array with the order of the services
     */
    getServicesOrder() {
        const order = _.get(this, 'services._order', Object.keys(this.getAllServices()));
        return order;
    }


    /**
     * @return array with the order of the networks
     */
    getNetworksOrder() {
        const order = _.get(this, 'networks._order', Object.keys(this.getAllNetworks()));
        return order;
    }

    /**
     * @return array with the order of the volumes
     */
    getVolumesOrder() {
        const order = _.get(this, 'volumes._order', Object.keys(this.getAllVolumes()));
        return order;
    }

    /**
     * Given callback will be called with serviceName and the serviceInstance
     * @param cb
     * @return {*}
     */
    mapOverServices(cb) {
        return this._mapOver('services', cb);
    }

    /**
     * Given callback will be called with networkName and the networkInstance
     * @param cb
     * @return {*}
     */
    mapOverNetworks(cb) {
        return this._mapOver('networks', cb);
    }

    /**
     * Given callback will be called with volumeName and the volumeInstance
     * @param cb
     * @return {*}
     */
    mapOverVolumes(cb) {
        return this._mapOver('volumes', cb);
    }

    /**
     * Change the service with the given service.
     * Given service should be an instance of ComposeModelService, the replacement is based on the service name
     * @param service
     */
    replaceServiceWith(service) {
        if (!(service instanceof Service)) {
            throw new Error('Not an instanceof Service');
        }
        if (!this.getAllServices()[service.getName()]) {
            throw new Error(`Service ${service.getName()} not exist`);
        }

        this.services.data[service.getName()] = service;
    }

    /**
     * Promise
     * @return - all image names in of all the services that have image
     */
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

    /**
     * Parse the input
     * @param yaml - string or js-obj
     * @param policy - optional
     */
    static parse(yaml, policy) {
        const originalYaml = yaml;
        if (_.isString(yaml)) {
            try {
                yaml = YAML.safeLoad(yaml);
            } catch (err) {
                return Promise.reject(new CmErrors.YamlSyntaxError(yaml, err.message));
            }
        }

        if (!policy) {
            policy = policies.shared;
        }
        let Parser;
        try {
            Parser = CFComposeModel.getParserForYaml(yaml);
        } catch (err) {
            return Promise.reject(err);
        }
        return Parser.parse(yaml, policy)
            .catch(err => {
                if (err instanceof CmErrors.ParsingComposeError) {
                    err.setInput(originalYaml);
                }
                throw err;
            });
    }

    /**
     * Load the file and try to parse in into ComposeModel
     * @param location required - absolute location of the file , use path.resolve(__dirname, relative-path)
     * @param policy optional - A policy that should be apply , the default is the Codefresh shared
     */
    static load(location, policy) {
        const yamlString = fs.readFileSync(location, 'utf8');
        return CFComposeModel.parse(yamlString, policy);
    }

    static getParserForYaml(yamlObj) {
        const parsers = CFComposeModel.getParsersForYaml(yamlObj);
        return parsers.Parser;
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
            throw new CmErrors.YamlNotSuppliedError();

        } else if (!yamlObj.version) {
            return parsers.ComposeV1;
        } else if (yamlObj.version === '2' || yamlObj.version === '2.0') {
            return parsers.ComposeV2;
        } else if (yamlObj.version === '3' || yamlObj.version === '3.0') {
            return parsers.ComposeV3;
        } else {
            throw new CmErrors.ParserNotFoundError(yamlObj);
        }
    }

    static stringifyWarnings(warnings){
        return Promise.map(warnings, warning => {
           return `${JSON.stringify(warning.format())}\n`;
        });
    }

    static stringifyErrors(errors){
        return Promise.map(errors, error => {
            return `${JSON.stringify(error.format())}\n`;
        });
    }
}

module.exports = CFComposeModel;
