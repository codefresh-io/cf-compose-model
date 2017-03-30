'use strict';

const yaml = require('js-yaml');


class Base {
    constructor(composeModel, opt) {
        this.composeModel = composeModel;
        this.opt = opt;
    }

    toJson() {
        return this._toJson(this.composeModel, this.opt);
    }

    toYaml() {
        return this._toJson(this.composeModel, this.opt)
            .then((json) => {
                return yaml.dump(json);
            });
    }

    toFile() { //TODO implement in the future

    }
}

module.exports = Base;