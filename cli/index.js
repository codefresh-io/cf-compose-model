#!/usr/bin/env node
'use strict';

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
    .option("-f, --flow <path>", "The flow.yaml file")
    .action(function (cmd) {
        const run = require('./../e2e-test').run;
        return run(process.env.PWD, cmd);
    });

program.on('--help', function () {
    console.log('  Examples:');
    console.log();
    console.log('    $ deploy exec sequential');
    console.log('    $ deploy exec async');
    console.log();
});

program.parse(process.argv);