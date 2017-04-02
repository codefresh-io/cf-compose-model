'use strict';

const type = require('type-detect');
const _    = require('lodash');

function isTypeValid(value, expected){
    return type(value) === expected;
}

function isAnyTypeValid(value, expectedArray){
    return _.indexOf(expectedArray, type(value))  >= 0;
}

function regexMatch(test, regex) {
    if(!(regex instanceof RegExp)){
        regex = new RegExp(regex);
    }

    return regex.test(test);
}

module.exports = {
    isAnyTypeValid,
    isTypeValid,
    regexMatch
};