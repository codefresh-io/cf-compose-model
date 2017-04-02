'use strict';

const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const CFComposeModel = require('../../CFComposeModel');
const path           = require('path');
const parser         = require('./../ComposeV2');

const expect = chai.expect;
chai.use(sinonChai);

const filePath = path.join(__dirname, '..', '..', 'tests', 'ComposeV2', 'ex2.yaml');

describe('Compose V2 parser tests', () => {
    it('Should find all services in yaml', () => {
        return CFComposeModel.load(filePath)
            .then(compose => {
                expect(compose.getAllServices()).to.have.keys(['web', 'redis']);
                expect(compose.getServiceByName('web'))
                    .to
                    .have
                    .keys(['_metadata', 'image', '_order', 'networks', '_name', 'warnings']);
                expect(compose.getServiceByName('redis'))
                    .to
                    .have
                    .keys(['_metadata',
                        'image',
                        '_order',
                        'volumes',
                        'networks',
                        '_volumesType',
                        '_name',
                        'warnings'
                    ]);
            });
    });

    it('Should find all volumes in yaml', () => {
        return CFComposeModel.load(filePath)
            .then(compose => {
                expect(compose.getAllVolumes()).to.have.keys(['redis-data', 'mongo-data']);
            });
    });

    it('Should find all networkds in yaml', () => {
        return CFComposeModel.load(filePath)
            .then(compose => {
                expect(compose.getAllNetworks()).to.have.keys(['front', 'back']);
            });
    });

    it('Should parse compose v2', () => {
        const yamlJson = {
            version: '2',
            services: {
                os: {
                    image: 'image is ok',
                    ports: 'invalid syntax',
                    volumes: [
                        './from-host-creates-warnings:/root',
                        '${{CF_VOLUME}}:/not-a-warning'
                    ],
                    'key-not-in-compose-v2': 'created error'
                }
            },
            volumes: {
                data: {
                    external: true
                },
            },
        };
        return parser.parse(yamlJson)
            .then(() => {
                expect(true).to.be.equal(false);
            })
            .catch(err => {
                expect(err).to.have.keys(['errors', 'warnings', 'originalYaml', '_name', '_message']);
                expect(err.errors).to.be.deep.equal([
                    {
                        "_data": "invalid syntax",
                        "_fieldName": "ports",
                        "_message": "Ports must be array or object, got string",
                        "_name": "INVALID_SYNTAX_ON_FIELD"
                    },
                    {
                        "_data": "created error",
                        "_fieldName": "key-not-in-compose-v2",
                        "_message": "Field 'key-not-in-compose-v2' is not supported by compose v2 under services",
                        "_name": "FIELD_NOT_SUPPORTED"
                    }
                ]);
                expect(err.warnings).to.be.deep.equal([
                    {
                        "_actual": "./from-host-creates-warnings\n/root",
                        "_fieldName": "./from-host-creates-warnings",
                        "_fieldValue": "/root",
                        "_message": "Warning: at service os.volumes",
                        "_name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "_requireManuallyFix": true,
                        "_suggestion": "Volume mapping is not allowed, try use: /root",
                        "displayName": "volumes",
                        "readable": "Warning: at service os.volumes. The value ./from-host-creates-warnings\n/root is not allowed. Volume mapping is not allowed, try use: /root"
                    }
                ]);
            });

    });
});
