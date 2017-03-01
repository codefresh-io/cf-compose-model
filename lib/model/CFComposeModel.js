'use strict';

const EventEmitter = require('events');
const components   = require('./components');
const policies     = require('./policies');
const YAML         = require('yamljs');
const Service      = components.Service;

class CFComposeModel extends EventEmitter {
    constructor(originalYaml, policy = policies.shared) {
        super();
        this.originalYaml      = originalYaml;
        this.policy            = policy;
        this.parser            = CFComposeModel.getParserForYaml(this.originalYaml);
        this.defaultTranslator = CFComposeModel.getTranslatorForYaml(this.originalYaml);

        this.services = {};
        this.volumes  = {};
        this.networks = {};

        this.warnings = [];
        this.errors  = [];


        this.on('service-add', (data) => {
            this.getWarningsForService(data.name, data.service, this.policy.warnings.services);
        });

    }

    addService(name, data) {
        if (this.services[name]) {
            throw new Error('Cant add service with the same name');
        }
        const service = new Service(data);
        this.services[name] = service;
        this.emit('service-add', {name: name, service: service});
    }

    translate() {
        return YAML.stringify(this.defaultTranslator.translate(this), 4, 2);
    }

    getWarningsForService(serviceName, serviceObj, warningPolicy){
        const res = this.defaultTranslator.getWarningsForService(serviceName, serviceObj, warningPolicy);
        this.warnings = this.warnings.concat(res);

    }

    getWarnings() {
        return this.warnings;
    }

    static parse(yaml) {
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