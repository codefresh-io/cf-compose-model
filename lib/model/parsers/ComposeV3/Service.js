'use strict';

const ServiceComponent                  = require('./../../components/service/Service');
const FieldNotSupportedByOriginalParser = require('./../../errorsAndWarnings/Errors/FieldNotSupportedByOriginalParser');
const InvalidSyntexForParser            = require('./../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const FieldNotSupportedByPolicy         = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');
const Promise                           = require('bluebird'); // jshint ignore:line
const _                                 = require('lodash');
const type                              = require('type-detect');

const fields = ['build',
    'cap_app',
    'cap_drop',
    'command',
    'cgroup_parent',
    'container_name',
    'deploy',
    'devices',
    'depends_on',
    'dns',
    'dns_search',
    'tmpfs',
    'entrypoint',
    'env_file',
    'environment',
    'expose',
    'external_links',
    'extra_hosts',
    'group_add',
    'healthcheck',
    'image',
    'isolation',
    'labels',
    'links',
    'logging',
    'network_mode',
    'networks',
    'pid',
    'ports',
    'secrets',
    'security_opt',
    'stop_grace_period',
    'stop_signal',
    'sysctls',
    'ulimits',
    'volumes',
    'domainname',
    'hostname',
    'ipc',
    'mac_address',
    'privileged',
    'read_only',
    'restart',
    'shm_size',
    'stdin_open',
    'tty',
    'user',
    'working_dir'
];


class Service {
    constructor(name, value) {
        this.name = name;
        this.obj = value;
    }

    parse(accessibility) {

        const serviceInstance = new ServiceComponent(this.name);
        const serviceObject   = this.obj;
        const serviceKeys     = Object.keys(serviceObject);
        serviceInstance.setOrder(serviceKeys);
        return Promise.map(serviceKeys, (fieldName) => {


            function createWarningFieldNotSupportedByPolicy({ fieldName, fieldValue, serviceInstance, suggestion, autoFix }) {
                const warning = new FieldNotSupportedByPolicy(fieldName, fieldValue, suggestion, `Warning: at service ${serviceInstance.getName()}.${fieldName}`);
                warning.displayName= fieldName;
                if (autoFix) {
                    warning.setAutoFix();
                }
                serviceInstance.setAdditionalData(fieldName, warning);
            }

            const fieldValue = serviceObject[fieldName];
            const cases      = {
                'image': () => {
                    if (!_.isString(fieldValue)) {
                        const err = new InvalidSyntexForParser(fieldName, fieldValue, `Image must be string, got ${type(
                            fieldValue)}`);
                        serviceInstance.setImage(err);
                    } else {
                        serviceInstance.setImage(fieldValue);
                    }
                },
                'ports': () => {
                    if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                        const err = new InvalidSyntexForParser(fieldName, fieldValue, `Ports must be array or object, got ${type(
                            fieldValue)}`);
                        serviceInstance.addPort(err);
                    }
                    else {
                        if (_.isArray(fieldValue)) {
                            serviceInstance.setPortsOriginalType('Array');
                            _.forEach(fieldValue, (port) => {
                                serviceInstance.addPort(port);
                            });
                        } else {
                            // Its object, compose v1 not supporting in this way pass only the target
                            serviceInstance.setPortsOriginalType('Object');
                            _.forOwn(fieldValue, (target, source) => {
                                serviceInstance.addPort(`${source}:${target}`);
                            });
                        }
                    }
                },
                'volumes': () => {
                    if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                        const err = new InvalidSyntexForParser(fieldName, fieldValue, `Volumes must be array or object, got ${type(
                            fieldValue)}`);
                        serviceInstance.addVolume(err);
                    }

                    else {
                        if (_.isArray(fieldValue)) {
                            serviceInstance.setVolumesOriginalType('Array');
                            _.forEach(fieldValue, (volume) => {
                                serviceInstance.addVolume(volume);
                            });
                        } else {
                            serviceInstance.setVolumesOriginalType('Object');
                            _.forOwn(fieldValue, (target, source) => {
                                serviceInstance.addVolume(`${source}:${target}`);
                            });
                        }
                    }
                },
                'build': () => {
                    const isBuildSupported = accessibility.isBuildSupported();
                    if (!isBuildSupported) {
                        const suggestion = `image: ${serviceInstance.getName()}`;
                        createWarningFieldNotSupportedByPolicy({
                            fieldName,
                            fieldValue,
                            serviceInstance,
                            suggestion,
                            autoFix: true
                        });
                    } else {
                        serviceInstance.setAdditionalData(fieldName, fieldValue);
                    }

                },
                'container_name': () => {
                    const isContainerNameSupported = accessibility.isContainerNameSupported();

                    if(!isContainerNameSupported) {
                        const suggestion = `Field not supported , avoid using "${fieldName}"`;
                        createWarningFieldNotSupportedByPolicy({
                            fieldName,
                            fieldValue,
                            serviceInstance,
                            suggestion,
                            autoFix: true
                        });
                    } else {
                        serviceInstance.setAdditionalData(fieldName, fieldValue);
                    }
                }
            };

            if (cases[fieldName]) {
                cases[fieldName]();
            } else {
                if (_.indexOf(fields, fieldName) < 0) {
                    const err = new FieldNotSupportedByOriginalParser(fieldName, fieldValue, `Field '${fieldName}' is not supported by compose v2 under services`);
                    serviceInstance.setAdditionalData(fieldName, err);
                } else {
                    serviceInstance.setAdditionalData(fieldName, fieldValue);
                }
            }
        })
            .then(() => {
                return serviceInstance;
            });
    }
}


module.exports = Service;