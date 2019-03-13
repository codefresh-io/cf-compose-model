'use strict';

const InvalidSyntexForParser            = require('./../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const FieldNotSupportedByPolicy         = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');
const FieldNotSupportedByOriginalParser = require('./../../errorsAndWarnings/Errors/FieldNotSupportedByOriginalParser');
const Image                             = require('./../../components/service/Image');
const Port                              = require('./../../components/service/Port');
const Volume                            = require('./../../components/service/Volume');
const ServiceComponent                  = require('./../../components/service/Service');
const type                              = require('type-detect');
const _                                 = require('lodash');
const Promise                           = require('bluebird'); // jshint ignore:line
const DefaultAccessebility              = require('./../../accessibility/ServiceAccessibility');

const ROOT_USER_UID = '0';

class NewServiceParser {
    constructor(name, value) {
        this.errors          = [];
        this.name            = name;
        this.value           = value;
        this.accessibility   = this._getDefaultAccessibility();
        this.specialFields = [
            'image',
            'ports',
            'volumes',
            'build',
            'container_name',
            'privileged',
            'cgroup_parent',
            'cap_add',
            'cap_drop',
            'devices',
            'ipc',
            'logging',
            'shm_size',
            'pid',
            'ulimits',
        ];
        this.supportedFields = [
            'build',
            'publish-all-ports', //todo: remove it later
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
            'external_links',
            'extra_hosts',
            'image',
            'labels',
            'links',
            'pid',
            'ports',
            'security_opt',
            'stop_signal',
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
        ];
        this.defaultFieldValues = {
            user: ROOT_USER_UID,
        };
    }

    _getDefaultAccessibility() {
        return new DefaultAccessebility();
    }

    _createWarningFieldNotSupportedByPolicy({ fieldName, fieldValue, serviceName, suggestion, autoFix, requireManuallyFix }) {
        const warning       = new FieldNotSupportedByPolicy(fieldName, fieldValue, suggestion, `Warning: at service ${serviceName}.${fieldName}.`, autoFix, requireManuallyFix);
        warning.displayName = fieldName;
        return warning;
    }

    _isSpecialField(name) {
        return _.indexOf(this.specialFields, name) >= 0;
    }

    _isIsSupportedField(name){
        return _.indexOf(this.supportedFields, name) >= 0;
    }

    _getAdditionalData(service, name, value) {
        const accessibility = this.accessibility;
        const isPrivilegedModeSupported = accessibility.isPrivilegedModeSupported();
        if(!isPrivilegedModeSupported){
            const warning = this._createWarningFieldNotSupportedByPolicy({
                fieldName: name,
                fieldValue: value,
                serviceName: service.getName(),
                suggestion: `${name} not supported`,
                autoFix: false
            });
            return warning;
        }
        return value;
    }

    _actOnSpecialField(service, name, value) {
        const cases = {};
        [
            'privileged',
            'cap_add',
            'cgroup_parent',
            'cap_add',
            'cap_drop',
            'devices',
            'ipc',
            'logging',
            'shm_size',
            'tmpfs',
            'network_mode',
            'pid',
            'stop_grace_period',
            'sysctls',
            'ulimits',
            'network',
            'privileged',
        ]
        .map((p) => {
            Object.assign(cases, {
                [p]: () => service.setAdditionalData(name, this._getAdditionalData(service, p, value)),
            });
        });
        return cases[name](value);
    }

    _addDefaultValues(serviceInstance) {
        _.forEach(this.defaultFieldValues, (value, name) => {
            if (!serviceInstance.getByName(name)) {
                serviceInstance.setAdditionalData(name, value);
            }
        });
    }

    setAccessibility(accessibility) {
        this.accessibility = accessibility;
    }

    parse(accessibility) {
        if(accessibility){
            this.setAccessibility(accessibility);
        }
        const serviceInstance = new ServiceComponent(this.name);
        const serviceObj      = this.value;
        const serviceObjKeys  = _.keys(serviceObj);
        serviceInstance.setOrder(serviceObjKeys);
        return Promise.map(serviceObjKeys, (fieldName) => {
            const fieldValue = serviceObj[fieldName];

            if (this._isSpecialField(fieldName)) {
                this._actOnSpecialField(serviceInstance, fieldName, fieldValue);
            } else {
                if (!this._isIsSupportedField(fieldName)) {
                    const err = new FieldNotSupportedByOriginalParser(fieldName, fieldValue, `Field '${fieldName}' is not supported by compose`);
                    this.errors.push(err);

                } else {
                    serviceInstance.setAdditionalData(fieldName, fieldValue);
                }
            }
        })
            .then(() => {
                if (_.size(this.errors) > 0) {
                    const err    = new Error('FAILED_TO_PARSE');
                    err.errors   = this.errors;
                    err._service = serviceInstance;
                    throw err;
                }
                this._addDefaultValues(serviceInstance);
                return serviceInstance;
            });
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
        } catch (err) {
            throw new InvalidSyntexForParser(fieldName, volumeString, `Volume must be string, got ${type(
                volumeString)}: ${volumeString}`);
        }
    }
}

module.exports = NewServiceParser;
