'use strict';

const components           = require('./components');
const policies             = require('./policies');
const YAML                 = require('yamljs');
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
            data: {}
        };
        this.volumes      = {
            data: {}
        };
        this.networks     = {
            data: {}
        };
        this.policy       = policies.shared;
        this.accessiblity = {
            services: new ServiceAccessibility(),
            networks: new NetworkAccessibility(),
            volumes: new VolumeAccessibility()
        }
    }

    _getServicesAccessibility(){
        return _.get(this, 'accessiblity.services', {});
    }

    _getVolumesAccessibility(){
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

    getPolicies() {
        const roots    = ['services', 'networks', 'volumes'];
        const policies = {};
        roots.map((root) => {
            policies[root] = _.get(this, `${root}[policies]`, {});
        });
        return policies;
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
        let res      = [];
        const policy = this.getPolicies();
        _.forOwn(this.getAllServices(), (service) => {
            res = res.concat(service.getWarnings(this._getServicesAccessibility()));
        });

        const volumes = this.getAllVolumes();
        const accessibility = this._getVolumesAccessibility()
        if (!accessibility.isGlobalVolumeAllowed()) {
            _.forOwn(volumes, volume => {
                const warning = new Warning('GLOBAL_VOLUMES_NOT_SUPPORTED', volume.getName(), 'Avoid using global volumes', `Warning at: volumes.${volume.getName()}`);
                res.push(warning);
            });

        }

        res = _.compact(res);
        return res.map((warning) => {
            return warning.toJson();
        });

    }

    fixWarnings(onlyAutoFix = false) {
        this.getWarnings();
        _.forOwn(this.getAllServices(), (service) => {
            service.fixWarnings(onlyAutoFix);
        });
    }

    getServiceByName(name) {
        const allServices = this.getAllServices();
        if (allServices[name]) {
            return allServices[name];
        }
        return;
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
        const yaml = YAML.load(location);
        return CFComposeModel.parse(yaml);
    }

    static getParserForYaml(yaml) {
        //avoid circular dep
        const parsers = require('./parsers');
        if (!yaml) {
            throw new Error('Yaml not supplied');
        } else if (!yaml.version) {
            return parsers.ComposeV1;
        } else if (yaml.version === '2') {
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
        } else {
            throw new Error('Translator not found');
        }
    }

}

module.exports = CFComposeModel;