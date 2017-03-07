'use strict';

class Shared {
    constructor() {

        this.services = {
            ports: [{
                name: 'NO_PERMISSION'
            }],
            volumes: [{
                name: 'NO_PERMISSION'
            }],
            'container_name': [{
                name: 'NOT_SUPPORTED',
                autoFix: true
            }],
            build: [{
                name: 'NOT_SUPPORTED',
                autoFix: true
            }],
            image: [{
                name: 'LACK_OF_DETAILS_TAG',
            }, {
                name: 'LACK_OF_DETAILS_OWNER_NAME',
                requireManuallyFix: true
            }]
        };
    }
}

module.exports = new Shared();