'use strict';

const _                      = require('lodash');
const InvalidSyntexForParser = require('./../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const Image                  = require('./../../components/service/Image');
const Port                   = require('./../../components/service/Port');
const Volume                 = require('./../../components/service/Volume');
const type                   = require('type-detect');


class Service {
    constructor() {}


    attemptToCreateImage(fieldName, imageString) {
        try {
            return new Image(imageString);
        } catch (err) {
            throw new InvalidSyntexForParser(fieldName, imageString, `Image must be string, got ${type(
                imageString)}`);
        }
    }

    attemptToCreatePort(fieldName, portString) {
        try {
            return new Port(portString);
        } catch (err) {
            throw new InvalidSyntexForParser(fieldName, portString, `Port must be string or number, got ${type(
                portString)}`);
        }
    }

    attemptToCreateVolume(fieldName, volumeString) {
        try {
            return new Volume(volumeString);
        } catch (err){
            throw new InvalidSyntexForParser(fieldName, volumeString, `Port must be string or number, got ${type(
                volumeString)}`);
        }
    }

}

module.exports = Service;