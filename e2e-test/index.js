'use strict';

const fs      = require('fs');
const path    = require('path');
const _       = require('lodash');
const YAML    = require('js-yaml');
const Promise = require('bluebird'); // jshint ignore:line
const steps   = require('./steps');
const colors  = require('colors'); // jshint ignore:line

function resolveDirecotory(pwd, filePath) {
    return path.resolve(pwd, path.dirname(filePath));
}

function resolveFileName(filePath) {
    return path.basename(filePath);
}

module.exports = {
    run: (folderPath, flowFileName) => {
        console.log(`running test from folder: ${folderPath}`);

        const fileName      = resolveFileName(flowFileName);
        const fileDirectory = resolveDirecotory(folderPath, flowFileName);
        console.log(`Working with file ${fileName}`);
        console.log(`Working with path ${fileDirectory}`);
        const flowFilePath  = path.resolve(__dirname, `${fileDirectory}/${fileName}`);
        let test            = fs.readFileSync(flowFilePath, 'utf8');
        test                = YAML.safeLoad(test);
        //force the first step to be load
        const stepInsatnces = [];
        _.forEach(test.steps, (stepValue, stepName) => {

            const factory = {
                load: () => { return new steps.Load(stepName, stepValue); },
                translate: () => {
                    stepValue.fileDirectory = fileDirectory;
                    return new steps.Translate(stepName, stepValue);
                },
                'get-warnings': () => { return new steps.GetWarnings(stepName, stepValue); },
                'fix-warnings': () => { return new steps.FixWarnings(stepName, stepValue); }
            };
            if (factory[stepValue.type]) {
                console.log(`Preparing step ${stepName}`);
                let step = factory[stepValue.type](stepName);
                stepInsatnces.push(step);
            } else {
                throw new Error(`Step type ${stepValue.type} not supported`);
            }

        });

        return Promise.reduce(stepInsatnces, (value, step) => {
            console.log(`Starting step ${step.getName()}`.green);
            return step.exec(value)
                .then((res) => {
                    console.log(`Step ${step.getName()} finished`.green);
                    return res;
                });
        }, fileDirectory);



    }
};