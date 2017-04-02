'use strict';

const _                                 = require('lodash');
const Base                              = require('./Base');
const Promise                           = require('bluebird'); // jshint ignore:line
const BaseError                         = require('./../errorsAndWarnings/Errors/Error');
const FieldNotSupportedByPolicy         = require('./../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');

class ComposeV2 extends Base {

    _toJson(compose) {
        let json = {
            version: '2'
        };

        const serviceKeys = compose.getServicesOrder();


        const jsonServices = json['services'] = {};

        return Promise.map(serviceKeys, (serviceName) => {

            const serviceInstance     = compose.getServiceByName(serviceName);
            jsonServices[serviceName] = {};
            const order               = serviceInstance.getOrder();
            const serviceJson         = {};

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

                    if (obj instanceof FieldNotSupportedByPolicy) {
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
                        const volume         = jsonVolumes[volumeName] = {};
                        const order = volumeInstance.getOrder();
                        return Promise.map(order, (name) => {
                            const obj = volumeInstance.getByName(name);

                            if (obj instanceof FieldNotSupportedByPolicy) {
                                volume[name] = obj.getFieldValue();
                            } else {
                                volume[name] = obj;
                            }

                            return Promise.resolve();
                        });
                    });

                }
                return;
            })
            .then(() => {
                const networks = compose.getAllNetworks();
                if (!_.isEmpty(networks)) {
                    const jsonNetworks = json['networks'] = {};
                    const networkNames = compose.getNetworksOrder();
                    return Promise.map(networkNames, (networkName) => {
                        const networkInstance = compose.getNetworkByName(networkName);
                        const network         = jsonNetworks[networkName] = {};
                        const order = networkInstance.getOrder();
                        return Promise.map(order, (name) => {
                            const obj = networkInstance.getByName(name);

                            if (obj instanceof FieldNotSupportedByPolicy) {
                                network[name] = obj.getFieldValue();
                            } else {
                                network[name] = obj;
                            }

                            return Promise.resolve();
                        });
                    });

                }
                return;
            })
            .then(() => {
                return json;
            });
    }

}

module.exports = ComposeV2;