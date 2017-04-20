'use strict';

const chai                      = require('chai');
const sinonChai                 = require('sinon-chai');
const CM                        = require('./../../CFComposeModel');
const translators               = require('./../../translators');
const V3Translator              = translators.ComposeV3;
const Service                   = require('./../../components/service/Service');
const FieldNotSupportedByPolicy = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');

const expect = chai.expect; // jshint ignore:line
chai.use(sinonChai);


describe('Translation tests', () => {

    describe('To Compose v3', () => {
        let composeModel;
        beforeEach(() => {
            composeModel = new CM();
        });
        it('Should translate when image exist', () => {
            composeModel.addService(new Service('ok').setImage('owner/ubuntu:tag'));
            return composeModel.translate(V3Translator).toJson()
                .then(json => {
                    expect(json.services.ok.image).to.be.deep.equal('owner/ubuntu:tag');
                });
        });

        it('Should parse when ports exist', () => {
            composeModel.addService(new Service('ok').addPort('8080/udp'));
            return composeModel.translate(V3Translator).toJson()
                .then(json => {
                    expect(json.services.ok.ports).to.be.deep.equal([
                        "8080/udp"
                    ]);
                });
        });

        it('Should parse when ports exist and by default the was obj', () => {
            const service                = new Service('ok');
            service.getPortsOriginalType = () => {return 'Object';};
            service.addPort('81:81/tcp');
            composeModel.addService(service);
            return composeModel.translate(V3Translator).toJson()
                .then(json => {
                    expect(json.services.ok.ports).to.be.deep.equal({
                        "81": "81/tcp"
                    });
                });
        });

        it('Should parse when volumes exist', () => {
            composeModel.addService(new Service('ok').addVolume('app:/app:rw'));
            return composeModel.translate(V3Translator).toJson()
                .then(json => {
                    expect(json.services.ok.volumes).to.be.deep.equal([
                        'app:/app:rw'
                    ]);
                });
        });

        it('Should parse when volumes exist and by default the was obj', () => {
            const service                  = new Service('ok');
            service.getVolumesOriginalType = () => {return 'Object';};
            service.addVolume('app:/app:rw');
            composeModel.addService(service);
            return composeModel.translate(V3Translator).toJson()
                .then(json => {
                    expect(json.services.ok.volumes).to.be.deep.equal({
                        app: '/app:rw'
                    });
                });
        });

        it('Should parse when have additional data that is not supported by policy', () => {
            const service = new Service('ok');
            service.setAdditionalData('expose',
                new FieldNotSupportedByPolicy('expose', [8080], 'use ports', 'expose is not supported'));
            composeModel.addService(service);
            return composeModel.translate(V3Translator).toJson()
                .then(json => {
                    expect(json.services.ok.expose).to.be.deep.equal([8080]);
                });
        });
    });
});



