'use strict';

const _ = require('lodash');
const InvalidSyntexForParser            = require(
    './../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const type                              = require('type-detect');


class Service {
    constructor() {}

    _parseImage(fieldName, imageString) {
        if (!_.isString(imageString)) {
            return new InvalidSyntexForParser(fieldName, imageString, `Image must be string, got ${type(
                imageString)}`);
        }
        return imageString;
    }

    _parsePorts(fieldName, ports, instance) {
        if (!_.isArray(ports) && !_.isPlainObject(ports)) {
            const err = new InvalidSyntexForParser(fieldName, ports, `Ports must be array or object, got ${type(
                ports)}`);
            instance.addPort(err);
        }
        else {
            if (_.isArray(ports)) {
                instance.setPortsOriginalType('Array');
                _.forEach(ports, (port) => {
                    instance.addPort(port);
                });
            } else {
                // Its object, compose v1 not supporting in this way pass only the target
                instance.setPortsOriginalType('Object');
                _.forOwn(ports, (target, source) => {
                    instance.addPort(`${source}:${target}`);
                });
            }
        }
    }

    _parseVolumes(fieldName, volumes, instance) {
        if (!_.isArray(volumes) && !_.isPlainObject(volumes)) {
            const err = new InvalidSyntexForParser(fieldName, volumes, `Volumes must be array or object, got ${type(
                volumes)}`);
            instance.addVolume(err);
        }
        else {
            if (_.isArray(volumes)) {
                instance.setVolumesOriginalType('Array');
                _.forEach(volumes, (volume) => {
                    instance.addVolume(volume);
                });
            } else {
                instance.setVolumesOriginalType('Object');
                _.forOwn(volumes, (target, source) => {
                    instance.addVolume(`${source}:${target}`);
                });
            }
        }
    }
}

module.exports = Service;