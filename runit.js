'use strict';

const path         = require('path');
const fs           = require('fs');
const _            = require('lodash');
const CM           = require('./');
const ComposeModel = CM.ComposeModel;

const Promise = require('bluebird'); // jshint ignore:line


/**
 * Currently supported only for compose v1
 * From now the flow will be as follow:
 * 1. load or parse yaml
 * 2.
 * 2.1 get the composeModel if the parsing is success
 * 2.1 catch the error. the error object will have additional data:
 * 2.1.1 err.errors | array | objects that represent the error. use .format() and print the data
 * 2.1.2 err.warnings | array | in case that we can see the warnings the error object will have also additional warnings . NOT INCLUDED YET
 * @return {*}
 */
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




