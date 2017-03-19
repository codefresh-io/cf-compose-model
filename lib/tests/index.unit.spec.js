'use strict';

const chai         = require('chai');
const sinonChai    = require('sinon-chai');
const path         = require('path');
const CM           = require('./../');
const ComposeModel = CM.ComposeModel;
const components   = CM.components;

const expect = chai.expect;
chai.use(sinonChai);

function loadComposeFromLocationAndLoad(file) {
    const location = path.resolve(__dirname, file);
    return ComposeModel.load(location);
}

describe('First test', () => {
    it('Should success', () => {
        expect(true).to.be.equal(true);
    });

    describe('Yaml with errors', () => {
        describe('Compose V1', () => {
            it('Should detect image is not string', () => {
                loadComposeFromLocationAndLoad('./yamls/ComposeV1/WithErrors/image.yaml')
                    .then(compose => {
                        return compose.getErrors();
                    })
                    .then((errors) => {
                        console.log(JSON.stringify(errors));
                    })
            });
        });
    });
});