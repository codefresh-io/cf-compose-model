'use strict';

const yaml = require('js-yaml');
const Base       = require('./Base');
const Promise    = require('bluebird'); // jshint ignore:line
const BaseError = require('./../validations/Errors/Error');
const fields     = ['build',
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

class ComposeV1 extends Base {
    translate(compose) {
        let json = {};

        const services    = compose.getAllServices();
        const serviceKeys = compose.getServicesOrder();

        return Promise.map(serviceKeys, (serviceName) => {
            const serviceInstance = services[serviceName];
            json[serviceName]     = {};
            const order           = serviceInstance.getOrder();
            const serviceJson     = {};
            const all             = serviceInstance.get(fields);


            return Promise.map(order, (name) => {
                const cases = {
                    'image': () => {
                        const image     = serviceInstance.getImage();
                        if(image instanceof BaseError){
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
                    serviceJson[name] = all[name];
                    return Promise.resolve();
                }

            })
                .then(() => {
                    json[serviceName] = serviceJson;
                });
        })

            .then(() => {
                return yaml.safeDump(json);
            });
    }
}

module.exports = new ComposeV1();