## Codefresh Compose Model

[![Codefresh build status]( https://g.codefresh.io/api/badges/build?repoOwner=codefresh-io&repoName=cf-compose-model&branch=master&pipelineName=cf-compose-model&accountName=codefresh-inc&type=cf-2)]( https://g.codefresh.io/repositories/codefresh-io/cf-compose-model/builds?filter=trigger:build;branch:master;service:58b4563445a0ac0100a91975~cf-compose-model)

Codefresh introducing CF-Compose-Model, our model for all compositions.
Using our compose model you can:
 * Verify that your composition is valid on Codefresh.io
 * Convert Composition from one type to another

Start here:
 * `npm install` to install all dependencies
 * `node example.js` to run the basic examples we provided

Road-map:
- [X] Support Compose V1
- [X] Support Compose V2
- [X] Support Compose V3
- [ ] CLI tool
- [ ] ES5 module

## Documantation

### Become familiar with ComposeModel structure
ComposeModel holds inside 3 basic objects - each one of the objects holds in instances of `CFNode` class:
* services
* networks
* volumes

More objects that ComposeModel holds:
* originalYaml - the yaml file ComposeModel parsed. Optional
* parser - the original parser class that used to parse the yaml. Optional
* defaultTranslator - the translator that will be used if no other translator will be passed in `translate` method. The defaultTranslator exist only if the ComposeModel parsed some yaml and a translator exist for it.
* policy - set of instructions that tell ComposeModel what are to possible warnings may each CFNode and CFLeaf have. The default value is the policy of the shared plan.
 
Methods of ComposeModel:
* static:
    * parse(yaml) - Parse an yaml, search for a parser for the yaml file, parse it and return ComposeModel instance. Throw an error `parser not found' if there is no parser.
    * load(path) - Loads the yaml and parse it the same way the `parse` does.
* public:
    * getAllServices() - return an object with all the services
    * getAllNetworks() - return an object with all the networks
    * getAllVolumes() - return an object with all the volumes
    * setPolicy(policy) - set the policy. Policies can be found in `lib/model/policies`.
    * addService(service) - add new service to the model
    * addNetwork(network) - add new network to the model
    * addVolume(volume) - add new volume to the model
    * translate(translator) - translate the model to yaml file, if translator not supplied the model will try to use the default translator if exist.
    * getWarnings() - return an array with all the warnings related to the model and the policy
    * fixWarnings(onlyAutoFix) - fix all the warnings on the model related to the policy. If `onlyAutoFix` flag is set then only warnings with this flag will be fixed. 




