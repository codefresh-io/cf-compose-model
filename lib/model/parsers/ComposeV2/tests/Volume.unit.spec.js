'use strict';

const chai               = require('chai');
const sinonChai          = require('sinon-chai');
const expect             = chai.expect; // jshint ignore:line
const InvalidSyntaxError = require('./../../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const Parser             = require('./../Volume');
chai.use(sinonChai);

describe('Compose v2 volume parser', () => {
    it('Testing ', () => {
        const parser = new Parser("name", "value");
        return parser.parse()
            .catch(err => {
                expect(err.errors[0]).be.an.instanceof(InvalidSyntaxError);
            });
    });
});