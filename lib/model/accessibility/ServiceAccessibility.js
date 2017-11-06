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
        };
        this.image             = {
            allowMissingTag: false,
            alloMissingOwner: false
        };
        this.privileged = {
            supported: false
        };
    }

    allowPortMapping() {
        _.set(this, 'ports.allowPortMapping', true);
    }

    disallowPortMapping() {
        _.set(this, 'ports.allowPortMapping', false);
    }

    allowVolumeMapping() {
        _.set(this, 'volumes.allowVolumeMapping', true);
    }

    disallowVolumeMapping() {
        _.set(this, 'volumes.allowVolumeMapping', false);
    }

    isPortMappingSupported() {
        return _.get(this, 'ports.allowPortMapping', false);
    }

    isVolumeMappingSupported() {
        return _.get(this, 'volumes.allowVolumeMapping', false);
    }

    isBuildSupported() {
        return false;
    }

    isContainerNameSupported() {
        return false;
    }

    isContextSupported(){
        return false;
    }

    isMissingTagReproduceWarning(){
        return false;
    }

    isMissingOwnerReproduceWarning(){
        return false;
    }

    isMappingFromPredefinedVolumesAllowed(){
        return true;
    }

    isPrivilegedModeSupported(){
        return this.privileged.supported;
    }

    allowPrivilegedMode(){
        this.privileged.supported = true;
    }

    disallowPrivilegedMode(){
        this.privileged.supported = false;
    }



}

module.exports = ServiceAccessibility;