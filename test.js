const CF = require('./');
const ComposeModel = CF.ComposeModel;
const compose = ComposeModel.load('/Users/oleg/workspace/codefresh/cf-compose-model/lib/tests/yml1.yaml');
console.log(compose.getWarnings());