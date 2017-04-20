'use strict';

const yaml                      = require('js-yaml');
const Promise                   = require('bluebird'); // jshint ignore:line
const _                         = require('lodash');
const FieldNotSupportedByPolicy = require('./../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');

class Base {
    constructor(composeModel, opt) {
        this.composeModel = composeModel;
        this.opt          = opt;
    }

    _translateImage(serviceInstance, serviceJson) {
        const image = serviceInstance.getImage();
        if (image) {
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
    }

    _translatePorts(serviceInstance, serviceJson) {
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
                        portString += `/${protocol}`;
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
                        targetString += `/${protocol}`;
                    }

                    portsObject[source] = targetString;
                });
            }

        }
    }

    _translateServiceVolumes(serviceInstance, serviceJson) {
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
                        volumeString += `:${am}`;
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
    }

    _translateGlobalVolumes(compose, json) {
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
    }

    _translateGlobalNetworks(compose, json){
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
    }


    toJson() {
        return this._toJson(this.composeModel, this.opt);
    }

    toYaml() {
        return this._toJson(this.composeModel, this.opt)
            .then((json) => {
                return yaml.dump(json);
            });
    }

    toFile() { //TODO implement in the future

    }
}

module.exports = Base;