'use strict';

const InvalidSyntexForParser = require('./../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const FieldNotSupportedByPolicy = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');
const Image                  = require('./../../components/service/Image');
const Port                   = require('./../../components/service/Port');
const Volume                 = require('./../../components/service/Volume');
const type                   = require('type-detect');


class Service {
    constructor() {
        this.errors = [];
    }

    _createWarningFieldNotSupportedByPolicy({ fieldName, fieldValue, serviceName, suggestion, autoFix }){
        const warning       = new FieldNotSupportedByPolicy(fieldName, fieldValue, suggestion, `Warning: at service ${serviceName}.${fieldName}`);
        warning.displayName = fieldName;
        if (autoFix) {
            warning.setAutoFix();
        }
        return warning;
    }

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
            throw new InvalidSyntexForParser(fieldName, portString, `Port must be number, got ${type(
                portString)}: ${portString}`);
        }
    }

    attemptToCreateVolume(fieldName, volumeString) {
        try {
            return new Volume(volumeString);
        } catch (err){
            throw new InvalidSyntexForParser(fieldName, volumeString, `Port must be string, got ${type(
                volumeString)}: ${volumeString}`);
        }
    }


}

module.exports = Service;