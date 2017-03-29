'use strict'

const Promise = require('bluebird');
class Config {
  constructor() {
    this._defaultPromise = Promise;
  }

  setDefaultPromise(Promise){
    this._defaultPromise = Promise;
  }

  getDfaultPromise(){
    return this._defaultPromise;
  }

}

const config = new Config();

module.exports = config
