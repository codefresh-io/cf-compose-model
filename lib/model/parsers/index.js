'use strict';

module.exports = {
    ComposeV1: {
        Parser: require('./ComposeV1'),
        ServiceParser: require('./ComposeV1/Service')
    },
    ComposeV2: {
        Parser: require('./ComposeV2'),
        ServiceParser: require('./ComposeV2/Service'),
        NetworkParser: require('./ComposeV2/Network'),
        VolumeParser: require('./ComposeV2/Volume')
    },
    ComposeV3: {
        Parser: require('./ComposeV3'),
        ServiceParser: require('./ComposeV3/Service'),
        NetworkParser: require('./ComposeV2/Network'),
        VolumeParser: require('./ComposeV2/Volume')
    }
};