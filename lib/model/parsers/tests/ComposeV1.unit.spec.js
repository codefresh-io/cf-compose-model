'use strict';

const path           = require('path');
const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const CFComposeModel = require('../../CFComposeModel');
const ErrorComponent = require('./../../components/ErrorComponent');

const expect = chai.expect;
chai.use(sinonChai);

function getPath(name) {
    return path.resolve(__dirname, `./yamls/ComposeV1/${name}.yaml`);
}
describe('Compose v1 testing', () => {
    it('Should parse yaml', () => {

        const string = `cfrouter:
  image: codefresh/cf-router:develop
  labels:
    - "io.codefresh.owner=codefresh"
    - "io.codefresh.owner=codefresh111"
  ports:
    - "80:80"
  environment:
    NODE_ENV: development-docker
  links:
    - cfui:cf-ui
    - cfapi:cf-api`;

        return CFComposeModel.parse(string)
            .then(compose => {
                expect(compose.getAllServices()).to.be.deep.equal({
                    "cfrouter": {
                        "_metadata": {},
                        "_name": "cfrouter",
                        "_order": [
                            "image",
                            "labels",
                            "ports",
                            "environment",
                            "links",
                        ],
                        "_portsType": "Array",
                        "environment": {
                            "NODE_ENV": "development-docker"
                        },
                        "image": {
                            "_metadata": {},
                            "_name": "image",
                            "_owner": "codefresh",
                            "_repoName": "cf-router",
                            "_tag": "develop",
                            "warnings": []
                        },
                        "labels": [
                            "io.codefresh.owner=codefresh",
                            "io.codefresh.owner=codefresh111"
                        ],
                        "links": [
                            "cfui:cf-ui",
                            "cfapi:cf-api"
                        ],
                        "ports": [
                            {
                                "_metadata": {},
                                "_name": "ports",
                                "_protocol": undefined,
                                "_source": "80",
                                "_target": "80",
                                "warnings": []
                            }
                        ],
                        "warnings": []
                    }
                });
            });
    });

    describe('Should throw errors', () => {

        it('Should throw an error when image passed not as string', () => {
            const location = getPath('ex1.image');
            return CFComposeModel.load(location)
                .then(compose => {
                    const service = compose.getServiceByName('web');
                    const image   = service.getImage();
                    expect(image).to.be.instanceof(ErrorComponent);
                });
        });

        it('Should throw an error when ports passing not as object or array', () => {
            const location = getPath('ex2.ports');
            return CFComposeModel.load(location)
                .then((compose) => {
                    const service = compose.getServiceByName('web');
                    const ports = service.getPorts();
                    expect(ports.length).to.be.equal(1);
                    expect(ports[0]).to.be.instanceof(ErrorComponent);
                });
        });

        it('Should throw an error when volumes passing not as object or array', () => {
            const location = getPath('ex3.volumes');
            return CFComposeModel.load(location)
                .then(compose => {
                    const service = compose.getServiceByName('web');
                    const volumes = service.getVolumes();
                    expect(volumes.length).to.be.equal(1);
                    expect(volumes[0]).to.be.instanceof(ErrorComponent);
                });
        });

        it('Should throw an error when unsupported fields by compose passing', () => {
            const location = getPath('ex4.unsupported');
            return CFComposeModel.load(location)
                .then(compose => {
                    const service = compose.getServiceByName('web');
                    const field = service.get(['not_compose_field']);
                    expect(field['not_compose_field']).to.be.instanceof(ErrorComponent);
                });
        });
    });
});