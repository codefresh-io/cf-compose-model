'use strict';

const _    = require('lodash');
const Base = require('./Base');

class ServiceAccessibility extends Base {
    constructor() {
        super();
        this.build             = {
            supported: false
        };
        this['container_name'] = {
            supported: false
        };
        this.ports             = {
            allowPortMapping: false
        };
        this.volumes           = {
            allowVolumeMapping: false
        }
    }

    allowPortMapping() {
        _.set(this, 'ports.allowPortMapping', true);
    }

    disallowPortMapping(){
        _.set(this, 'ports.allowPortMapping', true);
    }

    allowVolumeMapping(){
        _.set(this, 'volumes.allowVolumeMapping', true);
    }

    disallowVolumeMapping(){
        _.set(this, 'volumes.allowVolumeMapping', false);
    }

    isPortMappingSupported(){
        return _.get(this, 'ports.allowPortMapping', false);
    }

    isVolumeMappingSupported(){
        return _.get(this, 'volumes.allowVolumeMapping', false);
    }

    isBuildSupported(){
        return false;
    }

    isContainerNameSupported(){
        return false;
    }

}

module.exports = ServiceAccessibility;