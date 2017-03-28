'use strict';

const Base = require('../Base');

class Volume extends Base {

    constructor(name) {
        super(name);
    }

    _getDriver(){
        return this.driver;
    }

    _getDefaultDriver(){
        return this._defaultDriver || 'local'; // TODO : Should be added be the policy
    }

    isExternalVolume() {
        return !!this.external;
    }

    isUsingLocalDriver(){
        let driver = this._getDriver();
        if(!driver){
            driver = this._getDefaultDriver();
        }
        return driver === 'local';
    }

}

module.exports = Volume;