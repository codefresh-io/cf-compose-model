'use strict';

const fs   = require('fs');
const path = require('path');
const YAML = require('js-yaml');
const _    = require('lodash');

const BaseStep = require('./BaseStep');

class Translate extends BaseStep {
    constructor(name, obj) {
        super('translate', name, obj);
    }

    _translateToYaml(promise) {
        const expectedResultObj = this._stepData;
        const expectedResult    = expectedResultObj.result;
        return promise.toYaml()
            .then(translated => {
                const yaml = YAML.safeDump(expectedResult);
                this._writeOutput(translated, 'The final translation is:');
                this._invokeAssertion(translated, yaml);
                return translated;
            });
    }

    _translateToJson(promise) {
        const expectedResultObj = this._stepData;
        const expectedResult    = expectedResultObj.result;
        return promise.toJson()
            .then(obj => {
                this._writeOutput(obj, 'The final translation is:');
                this._invokeAssertion(JSON.parse(expectedResult), obj);
                return obj;
            });
    }

    exec(composeModel) {
        const expectedResultObj = this._stepData;
        expectedResultObj.to    = expectedResultObj.to || 'yaml';
        const cases             = {
            yaml: this._translateToYaml.bind(this),
            json: this._translateToJson.bind(this)
        };

        if (cases[expectedResultObj.to]) {
            return cases[expectedResultObj.to](composeModel.translate())
                .catch((err) => {
                    this.throwError(`Translation to ${expectedResultObj.to} failed`);
                    throw err;
                });
        } else {
            return Promise.reject(new Error(`Translation method ${expectedResultObj.to} not supported`));
        }
    }
}

module.exports = Translate;