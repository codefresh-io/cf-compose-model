'use strict';
const Base = require('./Base');

class Pro extends Base {
    activate(compose) {
        compose.allowPortMapping();
        compose.allowServiceVolumeMapping();
        compose.allowGlobalVolumeUsage();
        compose.allowPrivilegedMode();
    }
}

module.exports = new Pro();