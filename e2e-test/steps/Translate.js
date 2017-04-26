'use strict';

const BaseStep = require('./BaseStep');
const YAML     = require('js-yaml');

const chai   = require('chai');
const expect = chai.expect;



class Translate extends BaseStep {
    constructor(name, obj) {
        super('translate', name, obj);
    }

    _translateToYaml(promise) {
        const expectedResultObj = this._stepData;
        const expectedResult = expectedResultObj.result;
        return promise.toYaml()
            .then(translated => {
                const yaml = YAML.safeDump(expectedResult);
                expect(translated).to.be.equal(yaml);
                if (this._stepData.print) {
                    console.log('The final translation is:');
                    console.log(yaml.yellow);
                }
                return translated;
            });
    }

    _translateToJson(promise) {
        const expectedResultObj = this._stepData;
        const expectedResult = expectedResultObj.result;
        return promise.toJson()
            .then(obj => {
                expect(JSON.parse(expectedResult)).to.be.deep.equal(obj);
                if (this._stepData.print) {
                    console.log('The final translation is:');
                    console.log(yaml.yellow);
                }
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