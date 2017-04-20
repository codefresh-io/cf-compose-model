'use strict';

const Base = require('../Base');
const _    = require('lodash');

const internalFields = ['_metadata',
    '_name',
    'warnings',
    '_order',
];

const DRIVER_OPTIONS_FIELD_NAME = 'driver_opts';


class Volume extends Base {

    constructor(name) {
        super(name);
    }

    _getDefaultDriver() {
        return this._defaultDriver || Volume.LOCAL_PROPERTY; // TODO : Should be added be the policy
    }

    isExternalVolume() {
        return !!this.external;
    }

    isUsingLocalDriver() {
        let driver = this.getDriver();
        if (!driver) {
            driver = this._getDefaultDriver();
        }
        return driver === Volume.LOCAL_PROPERTY;
    }

    setDriver(driver) {
        this.driver = driver;
    }

    getDriver() {
        return this.driver;
    }

    setExternal() {
        if (this.driver || this.getByName(Volume.DRIVER_OPTIONS_FIELD_NAME)) {
            throw new Error('Cannot set external volume that use driver or driver_opts');
        }
        this.external = true;
    }

    /**
     * Returns the order of the properties
     * @return {*}
     */
    getOrder() {
        return _.keys(_.omit(this, Volume._INTERNAL_FIELDS));
    }

    static get DRIVER_OPTIONS_FIELD_NAME(){
        return DRIVER_OPTIONS_FIELD_NAME;
    }

    static get _INTERNAL_FIELDS(){
        return internalFields;
    }

    static get LOCAL_PROPERTY(){
        return 'local';
    }

}

module.exports = Volume;