'use strict';

const BaseStep     = require('./BaseStep');
const cm           = require('./../../');
const Promise      = require('bluebird'); // jshint ignore:line
const _            = require('lodash');
const ComposeModel = cm.ComposeModel;

const chai   = require('chai');
const expect = chai.expect;



class GetWarnings extends BaseStep {
    constructor(name, obj) {
        super('get-warnings', name, obj);
    }

    exec(composeModel) {
        const warningsObject = this._stepData;
        if (!(composeModel instanceof ComposeModel)) {
            return Promise.reject(new Error('Not invoked with ComposeModel instance'));
        }
        return composeModel.getWarnings()
            .then(this.formatAllWarnings.bind(this))
            .then(result => {
                const res = _.get(warningsObject, 'result');
                if (res === 'empty') {
                    expect(result).to.be.deep.equal([]);
                }
                else if (res) {
                    expect(result).to.be.deep.equal(warningsObject.result);
                }
                if(warningsObject.print){
                    result.map((warning) => {
                        console.log(`Warning:`.bold);
                        console.log(JSON.stringify(warning).yellow);
                    });
                }
                return composeModel;
            });

    }
}

module.exports = GetWarnings;