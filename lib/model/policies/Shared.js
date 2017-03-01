'use strict';

const ComposeWarning = require('./../ComposeWarning');
const ComposeError   = require('./../ComposeError');

class Shared {
    constructor() {

        this.warnings = {
            services: {
                ports: [{
                    name: 'INTRUSIVE'
                }],
                volumes: [{
                    name: 'INTRUSIVE'
                }, {
                    name: 'NO_PERMISSON'
                }],
            }
        };

        this.errors = {
            services: {
                'container_name': [{
                    name: 'NOT_SUPPORTED'
                }],
            }
        }
    };
}

module.exports = new Shared();