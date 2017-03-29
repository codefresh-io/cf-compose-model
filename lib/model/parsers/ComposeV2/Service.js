'use strict';

const ServiceComponent                  = require('./../../components/service/Service');
const FieldNotSupportedByOriginalParser = require('./../../errorsAndWarnings/Errors/FieldNotSupportedByOriginalParser');
const FieldNotSupportedByPolicy         = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');
const Promise                           = require('bluebird'); // jshint ignore:line
const _                                 = require('lodash');
const BaseServiceParser                 = require('./../Base/Service');


const fields = ['build',
    'cap_app',
    'cap_drop',
    'command',
    'cgroup_parent',
    'container_name',
    'devices',
    'depends_on',
    'dns',
    'dns_search',
    'tmpfs',
    'entrypoint',
    'env_file',
    'environment',
    'expose',
    'extends',
    'external_links',
    'extra_hosts',
    'group_add',
    'image',
    'labels',
    'links',
    'logging',
    'log_opt',
    'network_mode',
    'networks',
    'pid',
    'ports',
    'security_opt',
    'stop_grace_period',
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
    'oom_score_adj',
    'privileged',
    'read_only',
    'restart',
    'shm_size',
    'stdin_open',
    'tty',
    'user',
    'working_dir'
];

class Service extends BaseServiceParser {

    constructor(name, value) {
        super();
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
                    serviceInstance.setImage(this._parseImage(fieldName, fieldValue));
                },
                'ports': () => {
                    this._parsePorts(fieldName, fieldValue, serviceInstance);
                },
                'volumes': () => {
                    this._parseVolumes(fieldName, fieldValue, serviceInstance);
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