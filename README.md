## Codefresh Compose Model

[![Codefresh build status]( https://g.codefresh.io/api/badges/build?repoOwner=codefresh-io&repoName=cf-compose-model&branch=master&pipelineName=cf-compose-model&accountName=codefresh-inc&type=cf-2)]( https://g.codefresh.io/repositories/codefresh-io/cf-compose-model/builds?filter=trigger:build;branch:master;service:58b4563445a0ac0100a91975~cf-compose-model)

Codefresh introducing CF-Compose-Model, our model for all compositions.
Using our compose model you can:
 * Verify that your composition is valid on Codefresh.io
 * Convert Composition from one type to another

Start here:
 * `npm install` to install all dependencies
 * `node example.js` to run the basic examples we provided
 
 
### Run and create e2e-test using [flow.yaml](CLI.md)

* using `npm`
    * `npm install -g cf-compose-model`
    * `cm test -f {{flow.yaml}}` file
* using docker image
    * `docker pull docker pull codefreshio/cf-compose-model:cli`
    * `docker run -t -v {{direcotry wtih flow.yaml}}:/flow codefreshio/cf-compose-model:cli test -f /flow/flow.yaml` 
* manually
    * clone this repo
    * `npm install`
    * `npm install -g mocha`
    * add your tests to `e2e-test/test/{{your-test-directory}}`
    * `mocha  /Users/oleg/workspace/codefresh/cf-compose-model/e2e-test/flow.spec.js`
 

Road-map:
- [X] Support Compose V1
- [X] Support Compose V2
- [X] Support Compose V3
- [ ] CLI tool
- [ ] ES5 module


