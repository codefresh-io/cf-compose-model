const program = require('commander');
const fs      = require('fs');
const path    = require('path');
const _       = require('lodash');
const YAML    = require('js-yaml');
const Promise = require('bluebird'); // jshint ignore:line
const steps   = require('./../e2e-test/steps');

program
    .version('0.0.1')
    .option('-f, --foo', 'enable some foo')
    .option('-b, --bar', 'enable some bar')
    .option('-B, --baz', 'enable some baz');

program
    .command('test <cmd>')
    .description('Test a single flow.yaml with docker-compose.yaml')
    .option("-f, --flow <mode>", "The flow.yaml file")
    .action(function(cmd, options){
        console.log(`Executing flow file from: ${cmd}`);

        const location = path.resolve(__dirname, cmd);
        let test           = fs.readFileSync(location, 'utf8');
        test               = YAML.safeLoad(test);
        const promises = [];

        console.log(`Found steps: ${test}`);

        _.forEach(test.steps, (stepValue, stepName) => {

            const cases = {
                load: new steps.Load().exec(path.dirname(location)),
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
        return Promise.reduce(promises, (value, promise) => promise(value))
            .catch((err) => {
                console.log(err)
            });

    });

program.on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ deploy exec sequential');
    console.log('    $ deploy exec async');
    console.log();
});

program.parse(process.argv);