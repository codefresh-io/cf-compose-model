'use strict';

const components = require('./components');
const policies   = require('./policies');
const YAML       = require('yamljs');
const _          = require('lodash');
const Service    = components.nodes.Service;
const Node       = require('./components/nodes/Service');

class CFComposeModel {
    constructor(originalYaml) {
        this.originalYaml      = originalYaml;
        this.parser            = CFComposeModel.getParserForYaml(this.originalYaml);
        this.defaultTranslator = CFComposeModel.getTranslatorForYaml(this.originalYaml);
        this.policy            = policies.shared;
        this.services          = {};
        this.volumes           = {};
        this.networks          = {};
    }

    setPolicy(policy) {
        this.policy = policy;
    }

    addService(name, data) {
        if (this.services[name]) {
            throw new Error('Cant add service with the same name');
        }
        const service       = new Service(name, data);
        this.services[name] = service;
    }

    translate(Translator) {
        if (Translator) {
            return YAML.stringify(Translator.translate(this), 4, 2);
        }
        return YAML.stringify(this.defaultTranslator.translate(this), 4, 2);
    }

    getWarnings() {
        let res = [];
        _.forOwn(this.services, (service) => {
            if (service instanceof Node) {
                res = res.concat(service.getWarnings(this.policy.services));
            }
        });
        return res.map((warning) => {
            return warning.toJson();
        });

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

    static load(path) {
        const yaml = YAML.load(path);
        return CFComposeModel.parse(yaml);
    }

    static getParserForYaml(yaml) {
        //avoid circular dep
        const parsers = require('./parsers');
        if (!yaml) {

        } else if (!yaml.version) {
            return parsers.ComposeV1;
        }
    }

    static getTranslatorForYaml(yaml) {
        //avoid circular dep
        const translators = require('./translators');
        if (!yaml) {

        } else if (!yaml.version) {
            return translators.ComposeV1;
        }
    }

}

module.exports = CFComposeModel;