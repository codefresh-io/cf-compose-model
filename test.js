const YAML = require('yamljs');
const yaml = YAML.load('/Users/oleg/workspace/codefresh/cf-compose-model/lib/model/tests/ComposeV1/ex2.yaml');
console.log(YAML.stringify(yaml, 4, 2));