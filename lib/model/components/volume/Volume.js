'use strict';

const Base = require('../Base');
const _    = require('lodash');

class Volume extends Base {

    constructor(name) {
        super(name);
    }

    isExternalVolume() {
        return !!this.external;
    }

}

module.exports = Volume;