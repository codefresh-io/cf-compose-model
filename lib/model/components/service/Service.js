'use strict';
const _       = require('lodash');
const Port    = require('./Port');
const Volume  = require('./Volume');
const Image   = require('./Image');
const Warning = require('../../ComposeWarning');
const Base    = require('../Base');


class Service extends Base {

    /**
     * @param serviceName | String - the name of the service
     * @param data | Object - all the service data as build,image
     */
    constructor(serviceName) {
        super(serviceName);
    }

    /**
     * Return all the warnings related to the policy of the service with all the warnings of all the service components
     * @param policy
     * @return {Array}
     */
    getWarnings(policy) {
        this.warnings = [];

        if(this['container_name']){
            const warning   = new Warning('CONTAINER_NAME_NOT_SUPPORTED', this['container_name'], 'Avoid using container_name field', `Warning: at service ${this.getName()}.container_name`);
            warning.autoFix = true;
            this.warnings.push(warning);
        }

        if(this['build'] && !_.get(policy, 'build.supported', false)){
            const warning   = new Warning('BUILD_NOT_SUPPORTED', this['build'], 'Set image instead', `Warning: at service ${this.getName()}.build`);
            warning.autoFix = true;
            this.warnings.push(warning);
        }

        if(this.getImage()){
            const warnings = this.getImage().getWarnings();
            _.forEach(warnings, warning => {
                warning.message = `Warning: at service ${this.getName()}.image`;
            });
            this.warnings = this.warnings.concat(warnings);
        }

        const allowPortMapping = _.get(policy, 'ports.allowPortMapping', false);
        if(this.getPorts() && !allowPortMapping){

            const ports = this.getPorts();

            _.forEach(ports, port => {
                const warnings = port.getWarnings(allowPortMapping);

                _.forEach(warnings, warning => {
                   warning.message = `Warning: at service ${this.getName()}.ports`;
                });
                this.warnings = this.warnings.concat(warnings);
            });
        }

        const allowVolumeMapping = _.get(policy, 'volumes.allowVolumeMapping', false);
        if(this.getVolumes() && !allowVolumeMapping){

            const volumes = this.getVolumes();

            _.forEach(volumes, volume => {
                const warnings = volume.getWarnings(allowVolumeMapping);
                _.forEach(warnings, warning => {
                    warning.message = `Warning: at service ${this.getName()}.volumes`;
                });
                this.warnings = this.warnings.concat(warnings);
            });
        }

        return this.warnings;
    }

    /**
     *
     * @param onlyAutoFix | Boolean - fix all warnings in the service
     */
    fixWarnings(onlyAutoFix) {

        _.forOwn(this, (field, fieldName) => {

            if (fieldName === 'warnings') {
                _.forEach(field, (warning) => {
                    if (!onlyAutoFix || (onlyAutoFix && warning.autoFix)) {
                        this._fixWarning(warning);
                    }
                });
            }

            if (_.isArray(field) && (field[0] instanceof Base)) {
                _.forEach(field, (value) => {
                    if (value.warnings.length > 0) {
                        value.fixWarnings(onlyAutoFix);
                    }
                });
            }
            else if (field instanceof Base) {
                field.fixWarnings(onlyAutoFix);
            }
        });
    }

    addLabel(key, value) {
        if (!this.labels) {
            this.labels = [];
        }
        if (_.isArray(this.labels)) {
            this.labels.push(`${key}=${value}`);
        } else {
            this.labels[key] = value;
        }
    }

    addPort(port) {
        if (!(port instanceof Port)) {
            port = new Port(port);
        }

        this.ports = this.ports || [];
        this.ports.push(port);
        return this;
    }

    addVolume(volume) {
        if (!(volume instanceof Volume)) {
            volume = new Volume(volume);
        }

        this.volumes = this.volumes || [];
        this.volumes.push(volume);
        return this;
    }

    setImage(image) {
        if (!(image instanceof Image)) {
            image = new Image(image);
        }
        this.image = image;
        return this;
    }

    addEnvironmentVariable(key, value) {
        if (!this.environment) {
            this.environment = [];
        }

        if (_.isArray(this.environment)) {
            this.environment.push(`${key}=${value}`);
        } else {
            this.environment[key] = value;
        }

        return this;
    }

    _fixWarning(violation) {
        const cases = {
            'BUILD_NOT_SUPPORTED': () => {
                delete this['build'];
                this.image = new Image()
                    .setRepo(this.getName())
                    .setTag('latest');
            },
            'CONTAINER_NAME_NOT_SUPPORTED': () => {
                delete this['container_name'];
            }
        };


        if (cases[violation.name] ) {
            return cases[violation.name]();
        }
        return;
    }

    get(fields) {
        const imageIndex   = fields.indexOf('image');
        if (imageIndex) {
            fields.splice(imageIndex, 1);
        }
        const volumesIndex = fields.indexOf('volumes');
        if (volumesIndex) {
            fields.splice(volumesIndex, 1);
        }
        const portsIndex   = fields.indexOf('ports');
        if (portsIndex) {
            fields.splice(portsIndex, 1);
        }

        return super.get(fields);
    }

    getImage(){
        return this.image;
    }

    getPorts(){
        return this.ports;
    }

    getVolumes(){
        return this.volumes;
    }

}

module.exports = Service;