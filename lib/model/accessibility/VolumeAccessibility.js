'use strict';

const _    = require('lodash');
const Base = require('./Base');

class VolumeAccessibility extends Base {
    constructor() {
        super();
        this.globalVolume = {
            supported: false
        };
    }

    allowGlobalVolumeUsage(){
        _.set(this, 'globalVolume.supported', true);
    }

    disallowGlobalVolumeUsage(){
        _.set(this, 'globalVolume.supported', false);
    }

    isGlobalVolumeAllowed(){
        return _.get(this, 'globalVolume.supported', false);
    }

    isExternalVolumeAllowed(){
        return true;
    }
}

module.exports = VolumeAccessibility;