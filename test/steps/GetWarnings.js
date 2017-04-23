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

class GetWarnings extends BaseStep {
    constructor() {
        super('get-warnings');
    }

    exec(warningsObject) {
        return function (composeModel) {
            if(!(composeModel instanceof ComposeModel)){
                throw new Error('Not invoked with ComposeModel instance');
            }
            return composeModel.getWarnings()
                .then(formatAllWarnings)
                .then(result => {
                    if(_.get(warningsObject, 'result')) {
                        expect(result).to.be.deep.equal(warningsObject.result);
                    }
                    return composeModel;
                });

        }
    }
}

module.exports = GetWarnings;