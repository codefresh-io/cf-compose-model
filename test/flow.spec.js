'use strict';

const fs        = require('fs');
const path      = require('path');
const _         = require('lodash');
const YAML      = require('js-yaml');
const chai      = require('chai');
const Promise   = require('bluebird'); // jshint ignore:line
const steps = require('./steps');



const flowFileName = 'flow.yaml';

const folderIterator = (folderPath) => {
    console.log(`checking folder: ${folderPath} for flow tests to run`);
    const dirContent = fs.readdirSync(folderPath);
    _.forEach(dirContent, (cont) => {
        const contPath  = path.resolve(folderPath, cont);
        const contStats = fs.statSync(contPath);
        if (contStats.isDirectory()) {
            folderIterator(contPath);
        } else if (cont === flowFileName) {
            runTest(folderPath);
        }
    });
};


const runTest = (folderPath) => {
    console.log(`running test from folder: ${folderPath}`);
    const flowFilePath = path.resolve(folderPath, flowFileName);
    let test           = fs.readFileSync(flowFilePath, 'utf8');
    test               = YAML.safeLoad(test);


    it(`${flowFilePath}`, function () {

        //force the first step to be load

        const promises = [];
        _.forEach(test.steps, (stepValue, stepName) => {

            const cases = {
                load: new steps.Load().exec(folderPath),
                translate: new steps.Translate().exec,
                'get-warnings': new steps.GetWarnings().exec,
                'fix-warnings': new steps.FixWarnings().exec,
            };

            if (cases[stepValue.type]) {
                console.log(`Running step ${stepName}`);
                const p = cases[stepValue.type](stepValue, stepName);
                promises.push(p);
            } else {
                throw new Error(`Step type ${stepValue.type} not supported`);
            }
        });

        return Promise.reduce(promises, (value, promise) => promise(value));

    });
};




describe('Compose Model Flow Tests', () => {
    folderIterator(__dirname);
});
