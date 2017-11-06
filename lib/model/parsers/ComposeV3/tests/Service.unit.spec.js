'use strict';

const chai                      = require('chai');
const sinonChai                 = require('sinon-chai');
const ComposeV3Service          = require('../Service');
const ServiceComponent          = require('../../../components/service/Service');
const InvalidSyntexForParser    = require('../../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const FieldNotSupportedByPolicy = require('../../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');


const expect = chai.expect;
chai.use(sinonChai);


const checkInvalidSyntexError = (service) => {
    expect(service.errors).to.have.length(1);
    expect(service.errors[0] instanceof InvalidSyntexForParser).to.be.equal(true);
};


const checkCustomError = (service) => {
    expect(service.errors).to.have.length(1);
    expect(service.errors[0]).to.be.equal('error');
};


describe('Compose V3 Service tests', () => {
    describe('Constructor', () => {

        it('Name and Value test', () => {

            const service = new ComposeV3Service('my-service', 'my-value');
            expect(service.name).to.be.equal('my-service');
            expect(service.value).to.be.equal('my-value');
        });

    });

    describe('image special field', () => {

        it('Error with no instance', () => {

            const service = new ComposeV3Service('my-service', 'my-value');
            service._actOnSpecialField(null, 'image', 'my-image');
            expect(service.errors).to.have.length(1);
        });

        it('Error with no instance', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'image', 'my-owner/my-repo:tag');
            expect(service.errors).to.have.length(0);
            const image = serviceInstance.getImage();
            expect(image.getRepo()).to.be.equal('my-repo');
            expect(image.getOwner()).to.be.equal('my-owner');
            expect(image.getTag()).to.be.equal('tag');
        });

    });


    describe('ports special field', () => {

        it('Error with string value', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');

            service._actOnSpecialField(serviceInstance, 'ports', '1234');
            checkInvalidSyntexError(service);
        });

        it('Error with number value', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');

            service._actOnSpecialField(serviceInstance, 'ports', 1234);
            checkInvalidSyntexError(service);
        });

        it('Add port with empty array', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');

            service._actOnSpecialField(serviceInstance, 'ports', []);
            expect(service.errors).to.have.length(0);

        });


        it('Fail on invalid port with array', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'ports', ['1234a']);
            checkInvalidSyntexError(service);
        });

        it('Fail service instance with array', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = {
                setPortsOriginalType: ()=> {
                },
                addPort: ()=> {
                    throw 'error';
                }
            };
            service._actOnSpecialField(serviceInstance, 'ports', ['1234']);
            checkCustomError(service);
        });

        it('Pass on valid port', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'ports', ['1234']);
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getPorts()).to.have.length(1);
        });


        it('Pass on multiple port', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'ports', ['1234', '12345']);
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getPorts()).to.have.length(2);
        });

        it('Pass with empty object', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'ports', {});
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getPorts()).to.have.length(0);
        });


        it('Pass with non empty object with one port', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'ports', {123: 321});
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getPorts()).to.have.length(1);
        });

        it('Pass with non empty object with multiple ports', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'ports', {123: 321, 5432: 1234});
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getPorts()).to.have.length(2);
        });

        it('Fail on invalid port in object ', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'ports', {123: 'a321', 5432: 1234});
            checkInvalidSyntexError(service);
        });

        it('Fail on adding port in service object ', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = {
                setPortsOriginalType: ()=> {
                },
                addPort: ()=> {
                    throw 'error';
                }
            };
            service._actOnSpecialField(serviceInstance, 'ports', {5432: 1234});
            checkCustomError(service);
        });


        //todo: need to test also the values of the port fields. It can be any type of object
        //todo: need to test valid fields. Can put any port number (even negative)

    });

    describe('volumes special field', () => {

        it('Error with string value', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');

            service._actOnSpecialField(serviceInstance, 'volumes', '1234');
            checkInvalidSyntexError(service);
        });


        it('Error with null value', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');

            service._actOnSpecialField(serviceInstance, 'volumes', null);
            checkInvalidSyntexError(service);
        });

        it('Pass with empty array', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');

            service._actOnSpecialField(serviceInstance, 'volumes', []);
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getVolumes()).to.have.length(0);
        });


        it('Fail on non string volume with array - number', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'volumes', [1234]);
            checkInvalidSyntexError(service);
        });

        it('Fail on non string volume with array - object', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'volumes', [{}]);
            checkInvalidSyntexError(service);
        });

        it('Fail on non string volume with array - array', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'volumes', [[]]);
            checkInvalidSyntexError(service);
        });


        it('Fail service instance with array', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = {
                setVolumesOriginalType: ()=> {
                },
                addVolume: ()=> {
                    throw 'error';
                }
            };
            service._actOnSpecialField(serviceInstance, 'volumes', ['my-volume']);
            checkCustomError(service);
        });

        it('Pass on valid volume', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'volumes', ['1234']);
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getVolumes()).to.have.length(1);
        });


        it('Pass on multiple volumes', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'volumes', ['1234', '12345']);
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getVolumes()).to.have.length(2);
        });

        it('Pass with empty object', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'volumes', {});
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getVolumes()).to.have.length(0);
        });


        it('Pass with non empty object with one volume', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'volumes', {'/a': '/b'});
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getVolumes()).to.have.length(1);
        });

        it('Pass with non empty object with multiple ports', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service._actOnSpecialField(serviceInstance, 'volumes', {'/a': '/b', '/d': '/e'});
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getVolumes()).to.have.length(2);
        });


        it('Fail on adding volume in service object ', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = {
                setVolumesOriginalType: ()=> {
                },
                addVolume: ()=> {
                    throw 'error';
                }
            };
            service._actOnSpecialField(serviceInstance, 'volumes', {'/a': '/b'});
            checkCustomError(service);
        });

    });


    describe('build special field', () => {

        it('Build not supported ', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isBuildSupported: () => {
                    return true;
                }
            });
            service._actOnSpecialField(serviceInstance, 'build', '1234');
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('build')).to.be.equal('1234');

        });

        it('Build  supported ', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isBuildSupported: () => {
                    return false;
                }
            });
            service._actOnSpecialField(serviceInstance, 'build', '1234');
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('build') instanceof FieldNotSupportedByPolicy).to.be.equal(true);

        });

    });

    describe('container_name special field', () => {

        it('container_name not supported ', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isContainerNameSupported: () => {
                    return true;
                }
            });
            service._actOnSpecialField(serviceInstance, 'container_name', '1234');
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('container_name')).to.be.equal('1234');

        });

        it('container_name  supported ', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isContainerNameSupported: () => {
                    return false;
                }
            });
            service._actOnSpecialField(serviceInstance, 'container_name', '1234');
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('container_name') instanceof FieldNotSupportedByPolicy).to.be.equal(true);

        });

    });

    describe('privileged special field', () => {

        it('privileged not supported ', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isPrivilegedModeSupported: () => {
                    return true;
                }
            });
            service._actOnSpecialField(serviceInstance, 'privileged', true);
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('privileged')).to.be.equal(true);

        });

        it('privileged  supported ', () => {

            const service         = new ComposeV3Service('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isPrivilegedModeSupported: () => {
                    return false;
                }
            });
            service._actOnSpecialField(serviceInstance, 'privileged', true);
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('privileged') instanceof FieldNotSupportedByPolicy).to.be.equal(true);

        });
    });

});
