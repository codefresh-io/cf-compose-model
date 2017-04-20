'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const expect    = chai.expect; // jshint ignore:line
const Parser    = require('./../Network');
chai.use(sinonChai);

describe('Compose v2 network parser', () => {
    it('Should get error from network', () => {
        const networkObj = {
            driver: 'bridge',
            unknown: true
        };
        const parser = new Parser('back', networkObj);
        return parser.parse({})
            .catch(err => {
                expect(err.errors).to.be.deep.equal([
                    {
                        "_data": true,
                        "_fieldName": "unknown",
                        "_message": "Field 'unknown' is not supported by compose under networks",
                        "_name": "FIELD_NOT_SUPPORTED"
                    }
                ]);
            }); 
    });
});