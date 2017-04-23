'use strict';

const BaseStep = require('./BaseStep');
const cm       = require('./../../');
const path     = require('path');
const YAML     = require('js-yaml');
const Promise   = require('bluebird'); // jshint ignore:line
const _         = require('lodash');
const ComposeModel = cm.ComposeModel;

const chai   = require('chai');
const expect = chai.expect;


function formatAllWarnings(unformatted) {
    return Promise.map(unformatted, (warning) => { return warning.format(); });
}

class FixWarnings extends BaseStep {
    constructor() {
        super('fix-warnings');
    }

    exec(fixWarningObj) {
        return function (composeModel) {

            if(!(composeModel instanceof ComposeModel)){
                throw new Error('Not invoked with ComposeModel instance');
            }

            return composeModel.fixWarnings()
                .then(formatAllWarnings)
                .then(remaningWarnings => {
                    expect(remaningWarnings).to.be.deep.equal(fixWarningObj.result || []);
                })
                .then(() => composeModel);

        }
    }
}

module.exports = FixWarnings;