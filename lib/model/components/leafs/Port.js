'use strict';

const Warning = require('./../../ComposeWarning');
const CFLeaf  = require('./../base').CFLeaf;

class Port extends CFLeaf {
    constructor(target, source, protocol, parentFieldName) {
        super(parentFieldName);
        this.source   = source;
        this.target   = target;
        this.protocol = protocol;
        this.stringValue = `${this.source ? this.source + ':' : ''}${this.target}${this.protocol ? '/' + this.protocol : ''}`;
    }


    _createWarning(type) {
        const cases = {
            'NO_PERMISSION': () => {
                if (this.source) {
                    return new Warning(type.name, `${this.source}:${this.target} ${this.protocol ?
                    '/' + this.protocol : ''}`, `${this.target}`);
                }
            }
        };
        if (cases[type.name]) {
            return cases[type.name]();
        }
    }


    _fixWarning(type) {
        const cases = {
            'NO_PERMISSION': () => {
                this.stringValue = `${this.target}${this.protocol? '/' + this.protocol : ''}`;
                delete this.source;
            }
        };

        if (cases[type.name]) {
            cases[type.name]();
        }
    }

    static parse(stringValue, parentFieldName) {
        const ports = stringValue.split(':');
        let source;
        let target;
        let protocol;
        if(ports.length === 1){
            let targetWithProtocol = ports[0].split('/');
            target = targetWithProtocol[0];
        } else if(ports.length === 3){
            source = `${ports[0]}:${ports[1]}`;
            let targetWithSource = ports[1].split('/');
            target = targetWithSource[0];
            protocol = targetWithSource[1];
        } else {
            source = ports[0];
            let targetWithSource = ports[1].split('/');
            target = targetWithSource[0];
            protocol = targetWithSource[1];
        }

        return new Port(target, source, protocol, parentFieldName);
    }
}

module.exports = Port;