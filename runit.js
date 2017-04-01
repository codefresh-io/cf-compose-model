'use strict';

const path         = require('path');
const _            = require('lodash');
const CM           = require('./');
const ComposeModel = CM.ComposeModel;

const Promise = require('bluebird'); // jshint ignore:line

function withYamlFiles() {
    const paths = [
        './test-compose.yaml'
    ];
    return Promise.mapSeries(paths, (location) => {
        location = path.resolve(__dirname, location);
        return ComposeModel.load(location)
            .catch(err => {
                _.forEach(err.errors, err => {
                    console.log(err.format());
                });
            });
    });
}



Promise.resolve()
    .then(withYamlFiles)
    .done();




