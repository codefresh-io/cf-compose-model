'use strict';
/*jslint latedef:false*/
const Warning     = require('./../../ComposeWarning');
const CFLeaf      = require('./../base').CFLeaf;
const BaseBuilder = require('./../base/BaseBuilder');

class Port extends CFLeaf {
    constructor(portBuilder) {
        if (!(portBuilder instanceof PortBuilder)) {
            throw new Error('Port accept only PortBuilder instance');
        }
        super(portBuilder.parent);
        this._source      = portBuilder.source;
        this._target      = portBuilder.target;
        this._protocol    = portBuilder.protocol;
        this._stringValue = `${this.source ? this.source + ':' : ''}${this.target}${this.protocol ?
        '/' + this.protocol : ''}`;
    }

    get source() {
        return this._source;
    }

    set source(newValue) {
        this._source = newValue;
    }

    get target() {
        return this._target;
    }

    set target(newValue) {
        this._target = newValue;
    }

    get protocol() {
        return this._protocol;
    }

    set protocol(newValue) {
        this._protocol = newValue;
    }


    _createWarning(type) {
        const cases = {
            'NO_PERMISSION': () => {
                if (this._source) {
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
                this._stringValue = `${this.target}${this.protocol ? '/' + this.protocol : ''}`;
                delete this._source;
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
        if (ports.length === 1) {
            let targetWithProtocol = ports[0].split('/');
            target                 = targetWithProtocol[0];
        } else if (ports.length === 3) {
            source               = `${ports[0]}:${ports[1]}`;
            let targetWithSource = ports[1].split('/');
            target               = targetWithSource[0];
            protocol             = targetWithSource[1];
        } else {
            source               = ports[0];
            let targetWithSource = ports[1].split('/');
            target               = targetWithSource[0];
            protocol             = targetWithSource[1];
        }

        return new PortBuilder()
            .buildProtocol(protocol)
            .buildTarget(target)
            .buildSource(source)
            .buildParent(parentFieldName)
            .build();
    }
}

class PortBuilder extends BaseBuilder {

    buildTarget(target) {
        this.target = target;
        return this;
    }

    buildSource(source) {
        this.source = source;
        return this;
    }

    buildProtocol(protocol) {
        this.protocol = protocol;
        return this;
    }

    build() {
        this.done = true;
        return new Port(this);
    }

}



Port.PortBuilder = PortBuilder;

module.exports = Port;