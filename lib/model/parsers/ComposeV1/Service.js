'use strict';

const InvalidSyntexForParser            = require('./../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const _                                 = require('lodash');
const ServiceParser                     = require('./../Base/Service');
const type                              = require('type-detect');

class Service extends ServiceParser {

    constructor(name, value) {
        super(name, value);
        this.specialFields = [
            'image',
            'ports',
            'volumes',
            'build',
            'container_name',
            'context',
            'privileged'
        ];
        this.supportedFields = ['build',
            'publish-all-ports', //todo: remove it later
            'dockerfile',
            'cap_app',
            'cap_drop',
            'command',
            'cgroup_parent',
            'container_name',
            'devices',
            'dns',
            'dns_search',
            'entrypoint',
            'env_file',
            'environment',
            'expose',
            'extends',
            'external_links',
            'extra_hosts',
            'image',
            'labels',
            'links',
            'log_driver',
            'log_opt',
            'net',
            'pid',
            'ports',
            'security_opt',
            'stop_signal',
            'ulimits',
            'volumes',
            'volume_driver',
            'volumes_from',
            'cpu_shares',
            'cpu_quota',
            'cpuset',
            'domainname',
            'hostname',
            'ipc',
            'mac_address',
            'mem_limit',
            'memswap_limit',
            'mem_swappiness',
            'privileged',
            'read_only',
            'restart',
            'shm_size',
            'stdin_open',
            'tty',
            'user',
            'working_dir'
        ];
    }

    _actOnSpecialField(service, name, value){
        const accessibility = this.accessibility;
        const cases      = {
            'image': () => {
                try {
                    const image = this.attemptToCreateImage(name, value);
                    service.setImage(image);
                } catch (err) {
                    this.errors.push(err);
                }
            },
            'ports': () => {
                if (!_.isArray(value) && !_.isPlainObject(value)) {
                    const err = new InvalidSyntexForParser(name, value, `Ports must be array or object, got ${type(value)}`);
                    this.errors.push(err);
                }
                else {
                    if (_.isArray(value)) {
                        service.setPortsOriginalType('Array');
                        _.forEach(value, (port) => {
                            try {
                                const portInstance = this.attemptToCreatePort(name, port);
                                service.addPort(portInstance);
                            } catch (err) {
                                this.errors.push(err);
                            }
                        });
                    } else {
                        // Its object, compose v1 not supporting in this way pass only the target
                        service.setPortsOriginalType('Object');
                        _.forOwn(value, (target, source) => {
                            try {
                                const portInstance = this.attemptToCreatePort(name, `${source}:${target}`);
                                service.addPort(portInstance);
                            } catch (err) {
                                this.errors.push(err);
                            }
                        });
                    }
                }
            },
            'volumes': () => {

                if (!_.isArray(value) && !_.isPlainObject(value)) {
                    const err = new InvalidSyntexForParser(name, value, `Volumes must be array or object, got ${type(value)}`);
                    this.errors.push(err);
                }
                else {
                    if (_.isArray(value)) {
                        service.setVolumesOriginalType('Array');
                        _.forEach(value, (volume) => {
                            try {
                                const volumeInstance = this.attemptToCreateVolume(name, volume);
                                service.addVolume(volumeInstance);
                            } catch (err) {
                                this.errors.push(err);
                            }
                        });
                    } else {
                        service.setVolumesOriginalType('Object');
                        _.forOwn(value, (target, source) => {
                            try {
                                const volumeInstance = this.attemptToCreateVolume(name, `${source}:${target}`);
                                service.addVolume(volumeInstance);
                            } catch (err) {
                                this.errors.push(err);
                            }
                        });
                    }
                }
            },
            'build': () => {
                const isBuildSupported = accessibility.isBuildSupported();
                if (!isBuildSupported) {
                    const suggestion = `Replace build property with image`;
                    const warning    = this._createWarningFieldNotSupportedByPolicy({
                        fieldName: name,
                        fieldValue: value,
                        serviceName: service.getName(),
                        suggestion,
                        autoFix: false,
                        requireManuallyFix: true
                    });
                    service.setAdditionalData(name, warning);

                } else {
                    service.setAdditionalData(name, value);
                }

            },
            'container_name': () => {
                const isContainerNameSupported = accessibility.isContainerNameSupported();
                if (!isContainerNameSupported) {
                    const suggestion = `Field not supported , avoid using "${name}"`;
                    const warning    = this._createWarningFieldNotSupportedByPolicy({
                        fieldName: name,
                        fieldValue: value,
                        serviceName: service.getName(),
                        suggestion,
                        autoFix: true
                    });
                    service.setAdditionalData(name, warning);
                } else {
                    service.setAdditionalData(name, value);
                }
            },
            'context': () => {
                const isContextSupported = accessibility.isContextSupported();
                if (!isContextSupported) {
                    const warning = this._createWarningFieldNotSupportedByPolicy({
                        fieldName: name,
                        fieldValue: value,
                        serviceName: service.getName(),
                        suggestion: '',
                        autoFix: true
                    });
                    service.setAdditionalData(name, warning);
                } else {
                    service.setAdditionalData(name, value);
                }
            }
        };
        try {
            return super._actOnSpecialField(service, name, value);
        } catch(err){
            return cases[name](value);
        }
    }
}


module.exports = Service;
