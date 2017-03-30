'use strict';

const _          = require('lodash');
const Base       = require('./Base');
const Promise    = require('bluebird'); // jshint ignore:line
const BaseError  = require('./../errorsAndWarnings/Errors/Error');
const FieldNotSupportedByOriginalParser = require('./../errorsAndWarnings/Errors/FieldNotSupportedByOriginalParser');
const FieldNotSupportedByPolicy         = require('./../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');

const fields = {
    service: ['build',
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
    ],
    network: ['driver', 'driver_opts', 'external', 'ipam', 'internal', 'external'],
    volume: ['driver', 'driver_opts', 'external']
};

class ComposeV3 extends Base {

    _toJson(compose) {
        let json = {
            version: '3'
        };

        const serviceKeys  = compose.getServicesOrder();
        const jsonServices = json['services'] = {};

        return Promise.map(serviceKeys, (serviceName) => {

            const serviceInstance = compose.getServiceByName(serviceName);
            jsonServices[serviceName]     = {};
            const order           = serviceInstance.getOrder();
            const serviceJson     = {};

            return Promise.map(order, (name) => {
                const cases = {
                    'image': () => {
                        const image = serviceInstance.getImage();
                        if (image instanceof BaseError) {
                            serviceJson['image'] = image.getData();
                        } else {
                            let imageString = ``;
                            const repo      = image.getRepo();
                            const tag       = image.getTag();
                            const owner     = image.getOwner();

                            if (owner) {
                                imageString += `${owner}/`;
                            }
                            imageString += `${repo}`;
                            if (tag) {
                                imageString += `:${tag}`;
                            }
                            serviceJson['image'] = imageString;
                        }
                    },
                    'ports': () => {
                        const ports = serviceInstance.getPorts();
                        if (ports && ports.length > 0) {
                            const type = serviceInstance.getPortsOriginalType();
                            if (type === 'Array' || serviceInstance.isBeenPortFix()) {
                                const portsArray = serviceJson['ports'] = [];
                                return Promise.map(ports, (port) => {
                                    let portString = ``;
                                    const source   = port.getSource();
                                    const target   = port.getTarget();
                                    const protocol = port.getProtocol();
                                    if (source) {
                                        portString += `${source}:`;
                                    }
                                    portString += `${target}`;
                                    if (protocol) {
                                        portString += `${protocol}`;
                                    }
                                    portsArray.push(portString);
                                })
                                    .then(() => {
                                        serviceJson['ports'] = portsArray;
                                    });
                            } else {
                                // Is object
                                const portsObject = serviceJson['ports'] = {};
                                return Promise.map(ports, (port) => {
                                    const source     = port.getSource();
                                    const target     = port.getTarget();
                                    const protocol   = port.getProtocol();
                                    let targetString = target;
                                    if (protocol) {
                                        targetString += `${protocol}`;
                                    }

                                    portsObject[source] = targetString;
                                })
                                    .then(() => {
                                        serviceJson['ports'] = portsObject;
                                    });
                            }

                        }
                        return;
                    },
                    'volumes': () => {
                        const volumes = serviceInstance.getVolumes();
                        if (volumes && volumes.length > 0) {
                            const type = serviceInstance.getVolumesOriginalType();
                            if (type === 'Array') {
                                const volumesArray = serviceJson['volumes'] = [];
                                return Promise.map(volumes, (volume) => {
                                    let volumeString = ``;
                                    const source     = volume.getSource();
                                    const target     = volume.getTarget();
                                    const am         = volume.getAccessMode();
                                    if (source) {
                                        volumeString += `${source}:`;
                                    }
                                    volumeString += `${target}`;
                                    if (am) {
                                        volumeString += `${am}`;
                                    }
                                    volumesArray.push(volumeString);
                                })
                                    .then(() => {
                                        serviceJson['volumes'] = volumesArray;
                                    });
                            } else {
                                //Is object
                                const volumesObject = serviceJson['volumes'] = {};
                                return Promise.map(volumes, (volume) => {
                                    const source     = volume.getSource();
                                    const target     = volume.getTarget();
                                    const am         = volume.getAccessMode();
                                    let volumeString = target;
                                    if (am) {
                                        volumeString += `:${am}`;
                                    }

                                    volumesObject[source] = volumeString;

                                })
                                    .then(() => {
                                        serviceJson['volumes'] = volumesObject;
                                    });
                            }

                        }
                        return;
                    }
                };

                if (cases[name]) {
                    cases[name]();
                    return Promise.resolve();
                } else {
                    const obj = serviceInstance.getByName(name);

                    if (obj instanceof FieldNotSupportedByOriginalParser) {
                        serviceJson[name] = obj.getData();
                    } else if (obj instanceof FieldNotSupportedByPolicy) {
                        serviceJson[name] = obj.getFieldValue();
                    } else {
                        serviceJson[name] = obj;
                    }

                    return Promise.resolve();
                }

            })
                .then(() => {
                    jsonServices[serviceName] = serviceJson;
                });

        })
            .then(() => {
                const volumes = compose.getAllVolumes();
                if (!_.isEmpty(volumes)) {
                    const jsonVolumes = json['volumes'] = {};
                    const volumeNames = compose.getVolumesOrder();
                    return Promise.map(volumeNames, (volumeName) => {
                        const volumeInstance = compose.getVolumeByName(volumeName);
                        if (!volumeInstance) {
                            throw Error('Not found'); // TODO : remove
                        }

                        const volume = jsonVolumes[volumeName] = {};
                        const allFields = volumeInstance.get(fields.volume);
                        _.merge(volume, allFields);
                    });

                }
                return;
            })
            .then(() => {
                const networks = compose.getAllNetworks();
                if (!_.isEmpty(networks)) {
                    const jsonVolumes = json['networks'] = {};
                    const networkNames = compose.getNetworksOrder();
                    return Promise.map(networkNames, (networkName) => {
                        const networkInstance = compose.getNetworkByName(networkName);
                        if (!networkInstance) {
                            throw Error('Not found'); // TODO : remove
                        }
                        const network = jsonVolumes[networkName] = {};
                        const allFields = networkInstance.get(fields.network);
                        _.merge(network, allFields);
                    });

                }
                return;
            })
            .then(() => {
                return json;
            });
    }

}

module.exports = ComposeV3;