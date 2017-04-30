'use strict';

const Promise = require('bluebird'); // jshint ignore:line
const _       = require('lodash');
const path    = require('path');
const fs      = require('fs');
const colors  = require('colors'); // jshint ignore:line

let chai = require('chai');

const expect = chai.expect;

class BaseStep {
    constructor(type, stepName, stepObject) {
        if (!type) {
            throw new Error('Step must have type');
        }
        this._type     = type;
        this._name     = stepName;
        this._stepData = stepObject;
    }

    getType() {
        return this._type;
    }

    getName() {
        return this._name;
    }

    exec() {
        throw new Error('Not implemented');
    }

    formatAllWarnings(unformatted) {
        return Promise.map(unformatted, (warning) => { return warning.format(); });
    }

    _writeOutputToConsole(output) {
        console.log(output.yellow);
    }

    _writeOutputToFile(output) {
        const isJson   = _.get(output, 'file', '').split('.').reverse()[0].toLowerCase() ===
                         'json';
        const location = path.resolve(this._stepData.fileDirectory,
            _.get(this, '_stepData.output.file'));
        console.log(`Writing result of step ${this.getName()} to file ${location}`.bold);
        if (isJson) {
            fs.writeFileSync(location, JSON.stringify(output), 'utf-8');
        } else {
            fs.writeFileSync(location, output);
        }
    }

    _writeOutput(translation, title) {
        const output = _.get(this, '_stepData.output');
        if (!output) {
            return;
        }

        if (output.console || _.isNull(output.console) || _.isUndefined(output.console)) {
            console.log(title.bold);
            this._writeOutputToConsole(translation);
        }

        if (output.file) {
            this._writeOutputToFile(translation);
        }
    }

    _invokeAssertion(expected, actual) {
        expect(expected).to.be.deep.equal(actual);
    }

}

module.exports = BaseStep;