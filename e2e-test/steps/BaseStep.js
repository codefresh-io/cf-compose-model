'use strict';

class BaseStep {
    constructor(type){
        if(!type){
            throw new Error('Step must have type');
        }
        this._type = type;
    }

    getType(){
        return this._type;
    }

    exec(){
        throw new Error('Not implemented');
    }
}

module.exports = BaseStep;