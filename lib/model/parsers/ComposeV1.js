'use strict';

const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const components     = require('./../components');

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
        const compose = new CFComposeModel(yaml);
        _.forOwn(yaml, (serviceObj, name) => {
            const serviceInstance = new components.Service(name);
            _.forOwn(serviceObj, (fieldValue, fieldName) => {
                const cases = {
                    'image': () => {
                        if(!_.isString(fieldValue)){
                            throw new Error('Image must be string');
                        }
                        serviceInstance.setImage(fieldValue);
                    },
                    'ports': () => {
                        if(!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)){
                            throw new Error('Ports must be array or object');
                        }
                        if (_.isArray(fieldValue)) {
                            _.forEach(fieldValue, (port) => {
                                serviceInstance.addPort(port);
                            });
                        } else {
                            _.forOwn(fieldValue, (port) => {
                                serviceInstance.addPort(port);
                            });
                        }
                    },
                    'volumes': () => {
                        if(!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)){
                            throw new Error('Volumes must be array or object');
                        }

                        if (_.isArray(fieldValue)) {
                            _.forEach(fieldValue, (volume) => {
                                serviceInstance.addVolume(volume);
                            });
                        } else {
                            _.forOwn(fieldValue, (volume) => {
                                serviceInstance.addVolume(volume);
                            });
                        }
                    }
                };

                if (cases[fieldName]) {
                    cases[fieldName]();
                } else {
                    if(fields.indexOf(fieldName) < 0 ){
                        throw new Error(`Field '${fieldName}' is not supported by compose v1`);
                    }
                    serviceInstance.setAdditionalData(fieldName, fieldValue);
                }
            });
            compose.addService(serviceInstance);
        });
        return compose;
    }
}

module.exports = ComposeV1;