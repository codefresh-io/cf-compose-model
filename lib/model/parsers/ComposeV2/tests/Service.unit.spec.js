'use strict';

const chai                   = require('chai');
const sinonChai              = require('sinon-chai');
const ComposeV2ServiceParser = require('./../Service');
const Service                = require('./../../../components/service/Service');
const expect                 = chai.expect;
chai.use(sinonChai);

describe('Compose v2 service parser', () => {
    const tests    = [
        {
        title: 'Basic parse',
        mockObj: {
            web: {}
        },
        expectedService: new Service('web')
    },
        {
        title: 'Should parse with image',
        mockObj: {
            web: {
                image: 'ubuntu'
            }
        },
        expectedService: new Service('web').setImage('ubuntu')
    },
        {
        title: 'Should parse with ports as array',
        mockObj: {
            web: {
                ports: ["80:80", "81:81"]
            }
        },
        expectedService: new Service('web').addPort('80:80').addPort('81:81')
    },
        {
        title: 'Should parse with environment variables as object',
        mockObj: {
            web: {
                environment: [
                    "key1=val1",
                    "key2=val2"
                ]
            }
        },
        expectedService: new Service('web').addEnvironmentVariable('key1', 'val1').addEnvironmentVariable('key2', 'val2')
    },
        {
        title: 'Should parse with environment variables as object',
        mockObj: {
            web: {
                command: ['ls', '-la']
            }
        },
        expectedService: new Service('web').setAdditionalData('command', ['ls', '-la'])
    }
    ];
    tests.map(test => {
        it(test.title, () => {
            const yamlString = test.mockObj.web;
            const composeV2ServiceParser = new ComposeV2ServiceParser('web', yamlString);
            composeV2ServiceParser.defaultFieldValues = {};
            return composeV2ServiceParser.parse()
                .then(service => {
                    expect(service).to.be.deep.equal(test.expectedService);
                });
        });
    });

    it('Should get the errors ', () => {
        const serviceObj = {
            iamge: 'typo in image prop',
            ports: 80,
            volumes: 'app'
        };
        const parser = new ComposeV2ServiceParser('os', serviceObj);
        return parser.parse({})
            .catch(err => {
                expect(err.errors).to.be.deep.equal([
                    {
                        "_data": "typo in image prop",
                        "_fieldName": "iamge",
                        "_message": "Field 'iamge' is not supported by compose",
                        "_name": "FIELD_NOT_SUPPORTED"
                    },
                    {
                        "_data": 80,
                        "_fieldName": "ports",
                        "_message": "Ports must be array or object, got number",
                        "_name": "INVALID_SYNTAX_ON_FIELD"
                    },
                    {
                        "_data": "app",
                        "_fieldName": "volumes",
                        "_message": "Volumes must be array or object, got string",
                        "_name": "INVALID_SYNTAX_ON_FIELD"
                    }
                ]);
            });
    });

    it('Should parse when ports are obj', () => {
        const serviceObj = {
            ports: {
                80: 80
            }
        };
        const parser = new ComposeV2ServiceParser('os', serviceObj);
        return parser.parse({})
            .then(service => {
                expect(service.getPorts()[0].getTarget()).to.be.deep.equal('80');
            });
    });

    it('Should find errors in ports when ports are array', () => {
        const serviceObj = {
            ports: [
                []
            ]
        };
        const parser = new ComposeV2ServiceParser('ok', serviceObj);
        return parser.parse({})
            .catch(err => {
                expect(err.errors).to.be.deep.equal([
                    {
                        "_data": [],
                        "_fieldName": "ports",
                        "_message": "Port must be number, got Array: ",
                        "_name": "INVALID_SYNTAX_ON_FIELD"
                    }
                ]);
            });
    });

    it('Should find errors in ports when ports are object', () => {
        const serviceObj = {
            ports: {
                80: 'abc'
            }
        };
        const parser = new ComposeV2ServiceParser('ok', serviceObj);
        return parser.parse({})
            .catch(err => {
                expect(err.errors).to.be.deep.equal([
                    {
                        "_data": "80:abc",
                        "_fieldName": "ports",
                        "_message": "Port must be number, got string: 80:abc",
                        "_name": "INVALID_SYNTAX_ON_FIELD"
                    }
                ]);
            });
    });

    it('Should find errors in volumes when ports are array', () => {
        const serviceObj = {
            volumes: [
                []
            ]
        };
        const parser = new ComposeV2ServiceParser('ok', serviceObj);
        parser.setAccessibility({
            isContainerNameSupported(){return false;}
        });
        return parser.parse()
            .catch(err => {
                expect(err.errors).to.be.deep.equal([
                    {
                        "_data": [],
                        "_fieldName": "volumes",
                        "_message": "Volume must be string, got Array: ",
                        "_name": "INVALID_SYNTAX_ON_FIELD"
                    }
                ]);
            });
    });

    it('Should parse when service have container_name and it is not supported', () => {
        const serviceObj = {
            'container_name': 'name'
        };

        const parser = new ComposeV2ServiceParser('ok', serviceObj);
        parser.setAccessibility({
            isContainerNameSupported: () => {
                return false;
            }
        });
        return parser.parse()
            .then(service => {
                expect(service.get(['container_name'])).to.be.deep.equal({
                    "container_name": {
                        "_actual": "container_name\nname",
                        "_autoFix": true,
                        "_fieldName": "container_name",
                        "_fieldValue": "name",
                        "_message": "Warning: at service ok.container_name.",
                        "_name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "_suggestion": "Field not supported , avoid using \"container_name\"",
                        "displayName": "container_name"
                    }
                });
            });
    });

    it('Should parse when service have container_name and it is supported', () => {
        const serviceObj = {
            'container_name': 'name'
        };

        const parser = new ComposeV2ServiceParser('ok', serviceObj);
        parser.setAccessibility({
            isContainerNameSupported: () => {
                return true;
            }
        });
        return parser.parse()
            .then(service => {
                expect(service.get(['container_name'])).to.be.deep.equal({
                    "container_name": "name"
                });
            });
    });

    it('Should parse when service have build and it is not supported', () => {
        const serviceObj = {
            'build': './'
        };

        const parser = new ComposeV2ServiceParser('ok', serviceObj);
        parser.setAccessibility({
            isBuildSupported: () => {
                return false;
            }
        });
        return parser.parse()
            .then(service => {
                expect(service.get(['build'])).to.be.deep.equal({
                    "build": {
                        "_actual": "build\n./",
                        "_fieldName": "build",
                        "_fieldValue": "./",
                        "_message": "Warning: at service ok.build.",
                        "_name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "_requireManuallyFix": true,
                        "_suggestion": "Replace build property with image",
                        "displayName": "build"
                    }
                });
            });
    });

    it('Should parse when service have container_name and it is supported', () => {
        const serviceObj = {
            'build': './'
        };

        const parser = new ComposeV2ServiceParser('ok', serviceObj);
        parser.setAccessibility({
            isBuildSupported: () => {
                return true;
            }
        });
        return parser.parse()
            .then(service => {
                expect(service.get(['build'])).to.be.deep.equal({
                    "build": "./"
                });
            });
    });

    it('Should parse when service have privileged and it is not supported', () => {
        const serviceObj = {
            'privileged': true
        };

        const parser = new ComposeV2ServiceParser('ok', serviceObj);
        parser.setAccessibility({
            isPrivilegedModeSupported: () => {
                return false;
            }
        });
        return parser.parse()
            .then(service => {
                expect(service.get(['privileged'])).to.be.deep.equal({
                    "privileged": {
                        "_actual": "privileged\ntrue",
                        "_fieldName": "privileged",
                        "_fieldValue": true,
                        "_message": "Warning: at service ok.privileged.",
                        "_name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "_suggestion": "privileged not supported",
                        "displayName": "privileged"
                    }
                });
            });
    });

    it('Should parse when service have privileged and it is supported', () => {
        const serviceObj = {
            'privileged': true
        };

        const parser = new ComposeV2ServiceParser('ok', serviceObj);
        parser.setAccessibility({
            isPrivilegedModeSupported: () => {
                return true;
            }
        });
        return parser.parse()
            .then(service => {
                expect(service.get(['privileged'])).to.be.deep.equal({
                    "privileged": true
                });
            });
    });


});
