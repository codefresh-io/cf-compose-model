| Name 	| Params 	| Returns 	| Throws 	| Additional 	|
|----------------	|-----------------------------	|----------------	|--------------	|-----------------------------------------------------------------------------------------------------	|
| parse 	| yaml - `string` or `object` 	| CFComposeModel 	| ParsingError 	| * Static method on CFComposeModel<br> * Parse an input to CFComposeModel instance, return `Promise` 	|
| load 	| path - `string` 	| CFComposeModel 	|  	| * Static method on CFComposeModel<br> * Load the file and then use `parse` to parse it 	|
|  	|  	|  	|  	|  	|
| getAllServices 	|  	| Object 	|  	| The returns object structure is {`name`: `CFService`} 	|
| getAllVolumes 	|  	| Object 	|  	| The returns object structure is {`name`: `CFVolume`} 	|
| getAllNetworks 	|  	| Object 	|  	| The returns object structure is {`name`: `CFNetwork`} 	|
|  	|  	|  	|  	|  	|
|  	|  	|  	|  	|  	|
|  	|  	|  	|  	|  	|
|  	|  	|  	|  	|  	|


Most useful methods of CFComposeModel:
* statis methods:
    * `parse(yaml)` - Promise - for given yaml as string, parse it and retur 
 
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
