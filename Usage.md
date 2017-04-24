| Name 	| Params 	| Returns 	| Throws 	| Additional 	|
|--------------------	|-------------------------------------------	|----------------------------	|-------------------------------------------------------------------	|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| parse 	| yaml - `string` or `object` 	| Promise - `CFComposeModel` 	| ParsingError 	| * Static method on CFComposeModel<br> * Parse an input to CFComposeModel instance.<br> 	|
| load 	| path - `string` 	| Promise -`CFComposeModel` 	|  	| * Static method on CFComposeModel * Load the file and then use `parse` to parse it. 	|
|  	|  	|  	|  	|  	|
| getAllServices 	|  	| `Object` 	|  	| The returns object structure is {`name`: `CmService`} 	|
| getAllVolumes 	|  	| `Object` 	|  	| The returns object structure is {`name`: `CmVolume`} 	|
| getAllNetworks 	|  	| `Object` 	|  	| The returns object structure is {`name`: `CmNetwork`} 	|
| setPolicy 	| policy - `CmPolicy` 	|  	|  	| Activate given policy on the composeModel.<br> 	|
| addService 	| service - `CmService` 	|  	| `Not an instanceof Service` `Cant add service with the same name 	| Add service to the compose model.<br>  The name of the service should not exist already. 	|
| addNetwork 	| network - `CmNetwork` 	|  	| `Not an instanceof Network` `Cant add network with the same name` 	| Add network to the compose model.<br> The name of the network should not exist already 	|
| addVolume 	| volume - `CmVolume` 	|  	| `Not an instanceof Volume` `Cant add volume with the same name` 	| Add global volume to the compose model.<br> The name of the volume should not exist already. 	|
| translate 	| translator - `CmTranslator` 	| `CmTranslator` - optional 	| `Default translator not exist` 	| When translator is passed, use the translator to initiate the CmTranslator instance, by default uses the default translator. `defaultTranslator` is the equivalent translator to the parser that been used.When creating the ComposeModel from scratch `defaultTranslator` not exist. 	|
| getWarnings 	|  	| Promise - [`CmWarning`] 	|  	| * Traverse over the compose model and returns all the warnings about it. 	|
| fixWarnings 	|  	| Promise - [`CmWarning`] 	|  	| Gets all the warnings and then fix warnings that can be fixed 	|
| getServiceByName 	| name - `string` 	| `CmService` 	|  	| Search for service with that name and returns it, `undefined` otherwise. 	|
| getNetworkByName 	| name - `string` 	| `CmNetwork` 	|  	| Search for network with that name and returns it, `undefined` otherwise. 	|
| getVolumeByName 	| name - `string` 	| `CmVolume` 	|  	| Search for volume with that name and returns it, `undefined` otherwise. 	|
| mapOverServices 	| cb - `function(name, CmService)` 	| Promise 	|  	| Iterate over all the services in the compose model. 	|
| mapOverNetworks 	| cb - `function(name, CmNetwork)` 	| Promise 	|  	| Iterate over all the networks in the compose model. 	|
| mapOverVolumes 	| cb - `function(name, CmVolume)` 	| Promise 	|  	| Iterate over all global volumes in the compose model 	|
| replaceServiceWith 	| service - `CmService` 	|  	| `Not an instanceof Service` `Service {{service name}} not exist` 	| Replace an existing service with a new one with the same name. 	|
| renameService 	| oldName - `string`<br> newName - `string` 	|  	| `{{oldName}} not found` 	| Change the name of existing service in the compose model. The service should exist. 	|
| getImageNames 	|  	| Promise - [`string`] 	|  	| Iterate over all the service and return all the names of the images. 	|


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
