'use strict';

const BBPromise = require('bluebird');

let instance = null;

/**
 * Its a singelton, note that when you testing it.
 * When running mocha to load all the test it will load all the module into the same environment.
 * Means that if somewhere you ser the provider, the following test will be affected by that.
 * Use reset function
 */
class PromiseProvider {
    constructor(Promise = BBPromise) {
        if(!instance){
            instance = this;
        }
        this._promiseClass = Promise;
        return instance;
    }

    setProvider(Promise){
        this._promiseClass = Promise;
    }

    get() {
        return this._promiseClass;
    }

    /**
     * @param {promise} bluebird promise
     * @param onFulfil {function}
     * @param onReject {function}
     * @return {promise}
     */
    resolve(promise, onFulfil, onReject){
        return this.get()
            .resolve(promise)
            .then(onFulfil, onReject);
    }

    resetProvider(){
        this.setProvider(BBPromise);
    }
}

module.exports = PromiseProvider;