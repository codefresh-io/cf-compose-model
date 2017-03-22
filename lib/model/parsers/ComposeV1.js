'use strict';

const type           = require('type-detect');
const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const components     = require('./../components');
const Promise        = require('bluebird'); // jshint ignore:line
const ErrorComponent = components.ErrorComponent;

const fields = ['build',
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

class ComposeV1 {
    static parse(yaml) {
        const compose     = new CFComposeModel(yaml);
        const serviceKeys = _.keys(yaml);
        return Promise.map(serviceKeys, (serviceName) => {
            const serviceObj      = yaml[serviceName];
            const serviceInstance = new components.Service(serviceName);
            const keys            = _.keys(serviceObj);
            serviceInstance.setOrder(keys);
            return Promise.map(keys, (fieldName) => {
                const fieldValue = serviceObj[fieldName];
                const cases      = {
                    'image': () => {
                        if (!_.isString(fieldValue)) {
                            const err = new ErrorComponent(fieldName, fieldValue, `Image must be string, got ${type(
                                fieldValue)}`);
                            serviceInstance.setImage(err);
                        } else {
                            serviceInstance.setImage(fieldValue);
                        }
                    },
                    'ports': () => {
                        if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                            const err = new ErrorComponent(fieldName, fieldValue, `Ports must be array or object, got ${type(
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
                            const err = new ErrorComponent(fieldName, fieldValue, `Volumes must be array or object, got ${type(
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
                    }
                };

                if (cases[fieldName]) {
                    cases[fieldName]();
                } else {
                    if (_.indexOf(fields, fieldName) < 0) {
                        const err = new ErrorComponent(fieldName, fieldValue, `Field '${fieldName}' is not supported by compose v1`);
                        serviceInstance.setAdditionalData(fieldName, err);

                    } else {
                        serviceInstance.setAdditionalData(fieldName, serviceObj[fieldName]);
                    }
                }
            })
                .then(() => {
                    return serviceInstance;
                });
        })
            .map(service => {
                compose.addService(service);
            })
            .then(() => {
                return compose;
            });
    }
}

module.exports = ComposeV1;