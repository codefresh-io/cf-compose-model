'use strict';
const Promise = require('bluebird'); // jshint ignore:line

const _                         = require('lodash');
const Port                      = require('./Port');
const Volume                    = require('./Volume');
const Image                     = require('./Image');
const Base                      = require('../Base');
const FieldNotSupportedByPolicy = require(
    './../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');
const internalFields            = ['_metadata',
    '_name',
    'warnings',
    '_isPortFixed',
    '_order',
    '_volumesType',
    '_portsType',
    '_isPortsShouldBePublished'
];
const managebaleFields          = ['image', 'ports', 'volumes'];

class Service extends Base {

    /**
     * @param serviceName | String - the name of the service
     * @param data | Object - all the service data as build,image
     */
    constructor(serviceName) {

        super(serviceName);
    }

    _fixWarning(violation) {
        const cases = {
            'build': () => {
                this._removeFromOrder('build');
                delete this['build'];
                this.image = new Image()
                    .setRepo(this.getName())
                    .setTag('latest');
                this._addKeyToTopOrder('image');
            },
            'container_name': () => {
                this._removeFromOrder('container_name');
                delete this['container_name'];
            }
        };


        if (cases[violation.getFieldName()]) {
            return cases[violation.getFieldName()]();
        }
        return;
    }

    _removeFromOrder(key) {
        const index = _.indexOf(this._order, key);
        if (index >= 0) {
            this._order.splice(index, 1);
        }
        return;
    }

    _addKeyToTopOrder(key) {
        this._order.splice(0, 0, key);
    }

    _getAllAdditionalData() {
        return _.omit(this, [...internalFields, ...managebaleFields]);
    }

    _isVolumeExist(volume) {
        const volumes         = this.getVolumes();
        const candidateSource = volume.getSource();
        const candidateTarget = volume.getTarget();
        let res               = false;
        _.forEach(volumes, hostVolume => {
            const hostSource = hostVolume.getSource();
            const hostTarget = hostVolume.getTarget();
            if (candidateTarget === hostTarget && candidateSource === hostSource) {
                res = true;
            }
        });

        return res;
    }

    isPortExist(port) {
        const candidateSource   = port.getSource();
        const candidateProtocol = port.getProtocol();
        const ports             = this.getPorts();
        let res                 = false;

        _.forEach(ports, hostPort => {
            const hostSource   = hostPort.getSource();
            const hostProtocol = hostPort.getProtocol();

            if(hostSource === candidateSource && !_.isUndefined(hostSource)){
                if(hostProtocol === candidateProtocol){
                    res = true;
                }
            }

        });

        return res;
    }

    /**
     * Return all the warnings related to the policy of the service with all the warnings of all the service components
     * @param policy
     * @return {Array}
     */
    getWarnings(policy, { allowedVolumes, globalVolumeWithLocalDriver }) {
        this.warnings = [];

        return Promise.resolve()
            .then(() => {
                return this._getAllWarningsFromSelf()
                    .then(warnings => {
                        this.warnings = this.warnings.concat(warnings);
                        return;
                    });
            })
            .then(() => {
                const image = this.getImage();
                if (image && image instanceof Image) {
                    const warnings = this.getImage().getWarnings(policy);
                    _.forEach(warnings, warning => {
                        warning.message     = `Warning: at service ${this.getName()}.image`;
                        warning.displayName = 'image';

                    });
                    this.warnings = this.warnings.concat(warnings);
                }
                return;
            })
            .then(() => {
                const allowPortMapping = policy.isPortMappingSupported();
                if (this.getPorts() && !allowPortMapping) {

                    const ports = this.getPorts();
                    return Promise.map(ports, (port) => {
                        return port.getWarnings()
                            .map(warning => {
                                warning.setMessage(`Warning: at service ${this.getName()}.ports`);
                                warning.displayName = 'ports';
                                warning.readable    =
                                    `${warning.getMessage()}. The value ${warning.getData()} is not allowed. ${warning.getSuggestion()}`;
                                return warning;
                            });
                    })
                        .then(warnings => {
                            return _.flatten(warnings);
                        })
                        .then(warnings => {
                            this.warnings = this.warnings.concat(warnings);
                        });
                }
            })
            .then(() => {
                const allowVolumeMapping                    = policy.isVolumeMappingSupported();
                const isMappingFromPredefinedVolumesAllowed = policy.isMappingFromPredefinedVolumesAllowed();
                if (this.getVolumes() && !allowVolumeMapping) {

                    const volumes = this.getVolumes();
                    return Promise.map(volumes, (volume) => {
                        return volume.getWarnings(allowVolumeMapping,
                            {
                                allowedVolumes: isMappingFromPredefinedVolumesAllowed ?
                                    allowedVolumes : [],
                                globalVolumeWithLocalDriver
                            })
                            .map(warning => {
                                warning.setMessage(`Warning: at service ${this.getName()}.volumes`);
                                warning.displayName = 'volumes';
                                warning.readable    =
                                    `${warning.getMessage()}. The value ${warning.getData()} is not allowed. ${warning.getSuggestion()}`;
                                return warning;
                            });
                    })
                        .then(warnings => {
                            return _.flatten(warnings);
                        })
                        .then(warnings => {
                            this.warnings = this.warnings.concat(warnings);
                        });

                }
            })
            .then(() => {
                return this.warnings;
            });
    }

    /**
     *
     * @param onlyAutoFix | Boolean - fix all warnings in the service
     */
    fixWarnings(onlyAutoFix) {
        _.forOwn(this, (field, fieldName) => {

            if (fieldName === 'warnings') {
                this.setPortBeenFixed(); // its here until we create class for specific warning
                _.forEach(field, (warning) => {
                    if (!onlyAutoFix || (onlyAutoFix && warning.isAutoFix())) {
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
        if (!this.isKeyExistInOrder('labels')) {
            this.pushToOrder('labels');
        }
        if (!this.labels) {
            this.labels = [];
        }
        if (_.isArray(this.labels)) {
            this.labels.push(`${key}=${value}`);
        } else {
            this.labels[key] = value;
        }
        return this;
    }

    /**
     * port can be string value that represents the port: like 8080:8080/tcp
     * or instance of Port class from components.Port
     * @param port
     */
    addPort(port) {
        if (!(port instanceof Port)) {
            port = new Port(port);
        }
        if (this.isPortExist(port)) {
            throw new Error('PORT_EXIST');
        }

        this.ports = this.ports || [];
        this.ports.push(port);

        if (!this.isKeyExistInOrder('ports')) {
            this.pushToOrder('ports');
            this.setPortsOriginalType('Array');
        }

        return this;
    }

    /**
     * Add new volume to the service
     * @param volume
     * @return {Service}
     */
    addVolume(volume) {
        if (!(volume instanceof Volume)) {
            volume = new Volume(volume);
        }

        if (this._isVolumeExist(volume)) {
            throw new Error('VOLUME_EXIST');
        }

        this.volumes = this.volumes || [];
        this.volumes.push(volume);
        if (!this.isKeyExistInOrder('volumes')) {
            this.pushToOrder('volumes');
        }

        return this;
    }

    setImage(image) {
        if (!this.isKeyExistInOrder('image')) {
            this.pushToOrder('image');
        }
        if (!(image instanceof Image)) {
            image = new Image(image);
        }
        this.image = image;
        return this;
    }

    addEnvironmentVariable(key, value) {
        if (!this.isKeyExistInOrder('environment')) {
            this.pushToOrder('environment');
        }
        if (!this.environment) {
            this.environment = [];
        }

        if (this.isKeyExistInEnvironmentVariables(key)) {
            return;
        }

        if (_.isArray(this.environment)) {
            this.environment.push(`${key}=${value}`);
        } else {
            this.environment[key] = value;
        }

        return this;
    }

    get(fields) {
        // TODO : use lodash
        const imageIndex = fields.indexOf('image');
        if (imageIndex >= 0) {
            fields.splice(imageIndex, 1);
        }
        const volumesIndex = fields.indexOf('volumes');
        if (volumesIndex >= 0) {
            fields.splice(volumesIndex, 1);
        }
        const portsIndex = fields.indexOf('ports');
        if (portsIndex >= 0) {
            fields.splice(portsIndex, 1);
        }

        return super.get(fields);
    }

    getImage() {
        return this.image;
    }

    getPorts() {
        return this.ports || [];
    }

    getVolumes() {
        return this.volumes || [];
    }

    getEnvironmentVarialbe(name) {
        if (_.isArray(this.environment)) {
            let res = '';
            _.forEach(this.environment, (env) => {
                const kv = env.split('=');
                if (kv[0] === name) {
                    res = kv[1];
                }
            });
            return res;
        } else if (this.environment) {
            return this.environment[name];
        }
    }

    getAllLabels() {
        return this.labels;
    }

    getLabel(name) {
        if (_.isArray(this.labels)) {
            let res = '';
            _.forEach(this.labels, (env) => {
                const kv = env.split('=');
                if (kv[0] === name) {
                    res = kv[1];
                }
            });
            return res;
        } else if (this.labels) {
            return this.labels[name];
        }
    }

    /**
     * Use 'Object' or 'Array' as string
     * @param type
     */
    setPortsOriginalType(type) {
        if (type !== 'Array' && type !== 'Object') {
            throw new Error('Ports holder type should be Array or Object');
        }
        this._portsType = type;
    }

    /**
     * @return String, 'Array' or 'Object'
     */
    getPortsOriginalType() {
        if (!this._portsType) {
            return 'Array';
        }
        return this._portsType;
    }

    /**
     * Use 'Object' or 'Array' as string
     * @param type
     */
    setVolumesOriginalType(type) {
        if (type !== 'Array' && type !== 'Object') {
            throw new Error('Volumes holder type should be Array or Object');
        }
        this._volumesType = type;
    }

    /**
     * @return String, 'Array' or 'Object'
     */
    getVolumesOriginalType() {
        if (!this._volumesType) {
            return 'Array';
        }
        return this._volumesType;
    }

    setPortBeenFixed() {
        this._isPortFixed = true;
    }

    /**
     * Returns the order of the properties
     * @return {*}
     */
    getOrder() {
        return _.keys(_.omit(this, internalFields));
    }

    /**
     * Returns all the environment variables
     * @return {Array}
     */
    getAllEvnironmentVarialbes() {
        return this.environment;
    }

    /**
     * Change the image with new one
     * @param image
     * @return {*}
     */
    replaceImageWith(image) {
        return this.setImage(image);
    }

    mapOverEnvironments(cb) {
        if (_.isArray(this.environment)) {
            return Promise.map(this.environment, (env) => {
                const kv = env.split('=');
                return cb(kv[0], kv[1]);
            });
        } else {
            const keys = _.keys(this.environment);
            return Promise.map(keys, (key) => {
                return cb(key, this.environment[key]);
            });
        }
    }

    mapOverAdditionalData(cb) {
        const order = this._getAllAdditionalData();
        const keys  = _.keys(order);
        return Promise.map(keys, (fieldName) => {
            const data = this.getByName(fieldName);
            if (data instanceof FieldNotSupportedByPolicy) {
                return cb(fieldName, data.getFieldValue());
            }
            return cb(fieldName, data);
        });
    }

    getVolumeByName(name) {
        const volumes = this.getVolumes();
        let res;
        if (_.isArray(volumes)) {
            _.forEach(volumes, (volume) => {
                if (volume.getName() === name) {
                    res = volume;
                }
            });
        } else {
            return volumes[name];
        }
    }

    mapOverLabels(cb) {
        if (_.isArray(this.labels)) {
            return Promise.map(this.labels, (env) => {
                const kv = env.split('=');
                return cb(kv[0], kv[1]);
            });
        } else {
            const keys = _.keys(this.labels);
            return Promise.map(keys, (key) => {
                return cb(key, this.labels[key]);
            });
        }
    }

    replaceEnvironmentVariableValueByKey(keySearch, newValue) {
        const vars  = this.getAllEvnironmentVarialbes();
        if (_.isArray(vars)) {
            _.forEach(vars, (envVar, index) => {
                const kv                = envVar.split('=');
                if(kv[0] === keySearch){
                    this.environment[index] = `${kv[0]}=${newValue}`;
                }
            });
        } else {
            _.forOwn(vars, (value, key) => {
                if (keySearch === key) {
                    vars[key] = newValue; // jshint ignore:line
                }
            });
        }
    }

    replaceEnvironmentVariableValueByValue(valueSearch, newValue){
        if(!this.isValueExistInEnvironmentVariables(valueSearch)){
            return;
        }

        const vars  = this.getAllEvnironmentVarialbes();
        if (_.isArray(vars)) {
            _.forEach(vars, (envVar, index) => {
                const kv                = envVar.split('=');
                if(kv[1] && kv[1] === valueSearch){
                    this.environment[index] = `${kv[0]}=${newValue}`;
                }
            });
        } else {
            _.forOwn(vars, (value, key) => {
                if (valueSearch === value) {
                    vars[key] = newValue; // jshint ignore:line
                }
            });
        }
    }

    isBeenPortFix() {
        return this._isPortFixed || false;
    }

    isKeyExistInEnvironmentVariables(key) {
        let res = false;
        if (_.isArray(this.environment)) {
            _.forEach(this.environment, (kvString) => {
                const kv = kvString.split('=');
                if (key === kv[0]) {
                    res = true;
                }
            });
        } else {
            res = !!this.environment[key];
        }
        return res;
    }

    isValueExistInEnvironmentVariables(value){
        let res = false;
        if (_.isArray(this.environment)) {
            _.forEach(this.environment, (kvString) => {
                const kv = kvString.split('=');
                if (value === kv[1]) {
                    res = true;
                }
            });
        } else {
            res = _.indexOf(_.values(this.environment), value) >= 0;
        }
        return res;
    }

    mapOverVolumes(cb) {
        const volumes = this.getVolumes() || [];
        return Promise.map(volumes, cb);
    }

    mergeWith(otherService) {
        if (!(otherService instanceof Service)) {
            throw new Error(`Given service is not with type of Service`);
        }

        if (!this.getImage() && otherService.getImage()) {
            this.setImage(otherService.getImage());
        }

        return Promise.resolve()
            .then(() => {
                otherService.mapOverEnvironments((key, value) => {
                    const hostKey = this.getEnvironmentVarialbe(key);
                    if (!hostKey) {
                        this.addEnvironmentVariable(key, value);
                    }
                });
            })
            .then(() => {
                otherService.mapOverLabels((key, value) => {
                    const hostKey = this.getLabel(key);
                    if (!hostKey) {
                        this.addLabel(key, value);
                    }
                });
            })
            .then(() => {
                otherService.mapOverAdditionalData((key, value) => {
                    const hostObj = this.get([key]);
                    if (!hostObj[key]) {
                        this.setAdditionalData(key, value);
                    }
                });
            })
            .then(() => {
                otherService.mapOverVolumes((volume) => {
                    this.addVolume(volume);
                });
            })
            .then(() => {
                //merge ports
                const guestPorts = otherService.getPorts();
                return Promise.map(guestPorts, (port) => {
                   if(!this.isPortExist(port)){
                       this.addPort(port);
                   }
                });
            })
            .then(() => {
                return this;
            });

    }

    shouldPublishAllPorts() {
        return !!this._isPortsShouldBePublished;
    }

    publishAllPorts() {
        this._isPortsShouldBePublished = true;
    }

    unPublishAllPorts() {
        this._isPortsShouldBePublished = false;
    }

    mapOverExposedPorts(cb){
        return Promise.map(this.getPorts(), (port) => {
            const target = port.getTarget();
            const portRange = target.split('-');
            const isPortRange = portRange.length > 1;
            if(isPortRange) {
                const from = parseInt(portRange[0]);
                const to = parseInt(portRange[1]) + 1;
                return Promise.map(_.range(from, to), (portString) => {
                    cb(portString.toString());
                });
            } else {
                cb(target);
            }
        });
    }

}

module.exports = Service;