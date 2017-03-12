'use strict';

const Base = require('./Base');
const _    = require('lodash');

class CFNode extends Base {

    constructor(name) {
        super();
        if (!name) {
            throw new Error(`${new.target.name} must has a name`);
        }
        this.name = name;
    }

    toJson() {
        return _.omit(this, ['name', 'warnings']);
    }

    get(fields){
        return _.pick(this, fields);
    }

}

module.exports = CFNode;