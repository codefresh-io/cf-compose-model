'use strict';

const chai         = require('chai');
const sinonChai    = require('sinon-chai');
const CM           = require('./../../CFComposeModel');
const translators  = require('./../../translators');
const components   = require('./../../components');
const Service      = components.Service;
const ServiceImage = components.ServiceImage;
const YAML         = require('yamljs');

const expect = chai.expect; // jshint ignore:line
chai.use(sinonChai);


describe('Translation tests', () => {

    describe('To Compose v2', () => {
        let compose;
        beforeEach(() => {
            compose = new CM();
            // TODO : add default to parent
        });

        it('Should validate that compose v2 has version', () => {
            const image = new ServiceImage('redis');

            const service = new Service('my-service', {
                image: image
            });
            compose.addService(service);
            expect(YAML.parse(compose.translate(translators.ComposeV2)).version).to.be.equal('2');

        });

        it('Should create compose v2 with just services', () => {
            const expected     = `version: '2'\nservices:\n  db:\n    image: redis\n  os:\n    image: 'ubuntu:16.04'\n  npm-module:\n    image: 'codefresh-io/cf-compose-mode:latest'\n`;
            const imageNames   = ['redis', 'ubuntu:16.04', 'codefresh-io/cf-compose-mode:latest'];
            const serviceNames = ['db', 'os', 'npm-module'];
            imageNames.map((string, index) => {
                const image   = new ServiceImage(string);
                const service = new Service(serviceNames[index]).setImage(image);
                compose.addService(service);
            });
            expect(compose.translate(translators.ComposeV2)).to.be.deep.equal(expected);
        });

    });
});



