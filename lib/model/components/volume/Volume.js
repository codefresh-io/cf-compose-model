'use strict';

const Base = require('../Base');
const _    = require('lodash');

const internalFields = ['_metadata',
    '_name',
    'warnings',
    '_order',
];

class Volume extends Base {

    constructor(name) {
        super(name);
    }

    _getDefaultDriver() {
        return this._defaultDriver || 'local'; // TODO : Should be added be the policy
    }

    isExternalVolume() {
        return !!this.external;
    }

    isUsingLocalDriver() {
        let driver = this.getDriver();
        if (!driver) {
            driver = this._getDefaultDriver();
        }
        return driver === 'local';
    }

    setDriver(driver) {
        this.driver = driver;
    }

    getDriver() {
        return this.driver;
    }

    setExternal() {
        if (this.driver || this.getByName('driver_opts')) {
            throw new Error('Cannot set external volume that use driver or driver_opts');
        }
        this.external = true;
    }

    /**
     * Returns the order of the properties
     * @return {*}
     */
    getOrder() {
        return _.keys(_.omit(this, internalFields));
    }
}

module.exports = Volume;