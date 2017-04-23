'use strict';

const BaseStep = require('./BaseStep');
const cm       = require('./../../');
const path     = require('path');
const YAML     = require('js-yaml');

const chai   = require('chai');
const expect = chai.expect;

function translateToYaml(promise, expectedResult) {
    return promise.toYaml()
        .then(translated => {
            const yaml = YAML.safeDump(expectedResult);
            expect(translated).to.be.equal(yaml);
            return translated;
        });
}

function translateToJson(promise, expectedResult) {
    return promise.toJson()
        .then(obj => {
            expect(JSON.parse(expectedResult)).to.be.deep.equal(obj);
            return obj;
        });
}

class Translate extends BaseStep {
    constructor() {
        super('translate');
    }

    exec(expectedResultObj) {
        expectedResultObj.to = expectedResultObj.to || 'yaml';
        return function (composeModel) {
            const cases = {
                yaml: translateToYaml,
                json: translateToJson
            };

            if (cases[expectedResultObj.to]) {
                return cases[expectedResultObj.to](composeModel.translate(),
                    expectedResultObj.result);
            } else {
                throw new Error(`Translation method ${expectedResultObj.to} not supported`);
            }
        }
    }
}

module.exports = Translate;