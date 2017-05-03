'use strict';

const chai          = require('chai');
const sinonChai     = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

describe('Exporting steps', () => {
    it('Should export all the steps', () => {
        expect(require('./../')).to.have.keys([
            "FixWarnings",
            "GetWarnings",
            "Load",
            "Translate"
        ]);
    });
});