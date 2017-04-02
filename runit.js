'use strict';

const path         = require('path');
const fs           = require('fs');
const _            = require('lodash');
const CM           = require('./');
const ComposeModel = CM.ComposeModel;

const Promise = require('bluebird'); // jshint ignore:line


/**
 * Currently supported only for compose v1 and v2
 * From now the flow will be as follow:
 * 1. load or parse yaml
 * 2.
 * 2.1 get the composeModel if the parsing is success
 * 2.1 catch the error. the error object will have additional data:
 * 2.1.1 err.errors | array | objects that represent the error. use .format() and print the data
 * 2.1.2 err.warnings | array | in case that we can see the warnings the error object will have also additional warnings . NOT INCLUDED YET
 * @return {*}
 */

const paths = {
    errors: `./compose.model.errors`,
    warnings: `./compose.model.warnings`,
    afterFixWarnings: `./compose.model.warnings.after.fix`,
    translated: `./compose.model.translated`
};

function writeTo(filePath, data){
    const locaiton = path.resolve(__dirname, filePath);
    fs.writeFileSync(locaiton, data);
}

function writeWarnings(composeModel){
    return function() {
        const formatted = [];
        return composeModel.getWarnings()
            .then(warnings => {
                _.forEach(warnings, warning => {
                    formatted.push(`${JSON.stringify(warning.format())}\n`);
                });
                writeTo(paths.warnings, formatted);
            });
    };
}

function fixAndWrite(composeModel){
    return function () {
        const formatted = [];
        return composeModel.fixWarnings()
            .then(warnings => {
                _.forEach(warnings, warning => {
                    formatted.push(`${JSON.stringify(warning.format())}\n`);
                });
                writeTo(paths.afterFixWarnings, formatted

                );
            });
    };
}

function writeTranslation(composeModel){
    return function() {
        return composeModel.translate()
            .toYaml()
            .then(translated => {
                writeTo(paths.translated, translated);
            });
    };
}

function errors(err) {
    const formatted = [];
    if(err.errors) {
        formatted.push(`Errors: \n`);
        _.forEach(err.errors, (err) => {
            formatted.push(`${JSON.stringify(err.format())}\n`);
        });

        if(_.size(err.warnings) > 0){
            formatted.push(`Warnings: \n`);
            _.forEach(err.warnings, (warnings) => {
                formatted.push(`${JSON.stringify(warnings.format())}\n`);
            });
        }

        writeTo(paths.errors, formatted);
    } else {
        throw err;

    }
}

function run() {
    const location = process.argv[2];
    if(!location){
        throw new Error('location not supplied');
    }
    const fullPath = path.resolve(__dirname, location);
    console.log(`Loading file ${fullPath}`);
    return ComposeModel.load(fullPath)
        .then(composeModel => {
            return Promise.resolve()
                .then(writeWarnings(composeModel))
                .then(fixAndWrite(composeModel))
                .then(writeTranslation(composeModel));
        })
        .catch(errors);

}


return Promise.resolve()
    .then(run)
    .done(() => {
        //check what found
        console.log(`Done! see files ${JSON.stringify(paths)}`);
    });





