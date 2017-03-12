'use strict';

const components     = require('./components');
const policies       = require('./policies');
const YAML           = require('yamljs');
const _              = require('lodash');
const Service        = components.nodes.Service;
const Network        = components.nodes.Network;
const VolumeNode     = components.nodes.Volume;
const Warning        = require('./ComposeWarning');

class CFComposeModel {
    constructor(originalYaml) {
        this.originalYaml = originalYaml;
        if (originalYaml) {
            this.parser            = CFComposeModel.getParserForYaml(this.originalYaml);
            this.defaultTranslator = CFComposeModel.getTranslatorForYaml(this.originalYaml);
        }
        this.policy   = policies.shared;
        this.services = {};
        this.volumes  = {};
        this.networks = {};
    }

    getAllServices() {
        return this.services;
    }

    getAllVolumes() {
        return this.volumes;
    }

    getAllNetworks() {
        return this.networks;
    }

    setPolicy(policy) {
        this.policy = policy;
    }

    addService(service) {
        if (!(service instanceof Service)) {
            throw new Error('Not an instanceof Service');
        }

        const name = service.name;
        if (this.services[name]) {
            throw new Error('Cant add service with the same name');
        }
        this.services[name] = service;
    }

    addNetwork(network) {
        if (!(network instanceof Network)) {
            throw new Error('Not an instanceof Network');
        }
        const name = network.name;
        if (this.networks[name]) {
            throw new Error('Cant add network with the same name');
        }

        this.networks[name] = network;
    }

    addVolume(volume) {
        if (!(volume instanceof VolumeNode)) {
            throw new Error('Not an instanceof Volume');
        }
        const name = volume.name;
        if (this.networks[name]) {
            throw new Error('Cant add volume with the same name');
        }

        this.volumes[name] = volume;
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
        if (!this.policy) {
            throw new Error('Can not get warning without policy');
        }


        let res = [];

        _.forOwn(this.services, (service) => {
            res = res.concat(service.getWarnings(this.policy.services));
        });

        if (Object.keys(this.volumes).length) {
            _.forOwn(_.get(this, 'policy.volumes.global', []), (violation) => {
                const warning = this._createWarning(violation, 'volumes', this.volumes);
                if (warning) {
                    warning.message = `Warning at: volumes`;
                    res.push(warning);
                }
            });
        }
        _.forOwn(this.volumes, (volume) => {
            res = res.concat(volume.getWarnings(this.policy.services));
        });

        _.forOwn(this.networks, (network) => {
            res = res.concat(network.getWarnings(this.policy.services));
        });
        res = _.compact(res);
        return res.map((warning) => {
            return warning.toJson();
        });

    }

    _createWarning(violation, fieldName, obj) {
        const cases = {
            'volumes': {
                'NOT_SUPPORTED': () => {
                    const warning              = new Warning(violation.name, JSON.stringify(obj), `Remove field`);
                    warning.requireManuallyFix = violation.requireManuallyFix;
                    return warning;
                }
            }
        };

        if (cases[fieldName] && cases[fieldName][violation.name]) {
            return cases[fieldName][violation.name]();
        }
    }

    fixWarnings(onlyAutoFix = false) {
        this.getWarnings();
        _.forOwn(this.services, (service) => {
            service.fixWarnings(onlyAutoFix);
        });
    }

    static parse(yaml) {
        if (_.isString(yaml)) {
            yaml = YAML.parse(yaml);
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