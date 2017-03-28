'use strict';

const Base = require('../Base');

class Volume extends Base {

    constructor(name) {
        super(name);
    }

    isExternalVolume() {
        return !!this.external;
    }

}

module.exports = Volume;