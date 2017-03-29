'use strict';

const chai               = require('chai');
const sinonChai          = require('sinon-chai');
const expect             = chai.expect; // jshint ignore:line
const InvalidSyntaxError = require('./../../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const Parser             = require('./../Volume');
chai.use(sinonChai);

describe('Compose v2 volume parser', () => {
    it.only('Testing ', () => {
        const parser = new Parser("name", "value");
        return parser.parse()
            .then(volume => {
                expect(volume).be.an.instanceof(InvalidSyntaxError);
            });
    });
});