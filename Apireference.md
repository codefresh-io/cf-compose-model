## Compose-Model usage

* [ComposeModel](#composemodel) 
* [CmService](#cmservice)
* CmNetwork
* [CmVolume](#cmvolume)
* CmPolicy
    * Class that should extends the BasePolicy from `lib/model/policies/Base.js`
    * Be singelton
    * Should implement method `activate(CfComposeModel)`
    * Should use the `ComposeModel` methods to manipulate it
* CmTranslator
* CmWarning
* [CmImage](#cmimage)


# ComposeModel

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


# CmService
| Name 	| Params 	| Returns 	| Throws 	| Additional 	|
|------------------------	|------------------------------------------	|-----------	|--------------	|-------------------------------------------------------------------------------------------	|
| addLabel 	| key - `stinrg`<br> <br> value - `string` 	| CmService 	|  	| Add new label to the service 	|
| addEnvironmentVariable 	| key - `stinrg`value - `string` 	| CmService 	|  	| Add new environment variable to the service 	|
| addPort 	| port - `string` 	| CmService 	| PORT_EXIST 	| Add new port to the service 	|
| addVolume 	| volume - `string` 	| CmService 	| VOLUME_EXIST 	| Add new volume to the service 	|
| setImage 	| image - `string` 	| CmService 	|  	| Set the image of the service, this will replace previous image if exist 	|
| get 	| [`string`] 	|  	|  	| * Get additional fields if exist on the service * Will not return image, volumes or ports 	|
| getImage 	|  	| `CmImage` 	|  	|  	|
| getPorts 	|  	| [`CmProt`] 	|  	|  	|
| getVolumes 	|  	| [`CmServiceVolume`] 	|  	|  	|
| getLabel	|  	| `string` 	|  	|  Return the value of the given label key	|
| mapOverEnvironments	|  cb - `function(key, value)`	|  Promise	|  	| Iterate over all the environment variables 	|
| mapOverLabels	|  cb - `function(key, value)`	|  Promise	|  	| Iterate over all the labels 	|
| mapOverAdditionalData	| cb - `function(name, object)` 	| Promise	|  	| Iterate over all additional on the service |
| mapOverVolumes	| cb - `function(name, CmServiceVolume)` 	| Promise	|  	|  Iterate over all the volumes of the service	|
| mergeWith	| CmService 	| CmService	| Promise 	| Merge the given service with the current one when the priority is for the current service 	|
| mapOverExposedPorts	|  	| Promise	|  	| Iterate over all ports that should the service expose 	|


# CmVolume
| Name               | Params   | Returns | Throws                                                    | Additional                 |
|--------------------|----------|---------|-----------------------------------------------------------|----------------------------|
| isExternalVolume   |          | Boolean |                                                           |                            |
| isUsingLocalDriver |          | Boolean |                                                           |                            |
| setDriver          | `string` |         |                                                           |                            |
| getDriver          |          | String  |                                                           |                            |
| setExternal        |          |         | Cannot set external volume that use driver or driver_opts | Set the volume ad external |

# CmImage

| Name               | Params   | Returns | Throws                                                    | Additional                 |
|--------------------|----------|---------|-----------------------------------------------------------|----------------------------|
| constructor        | `string` | CmImage | `TYPE_NOT_MATCH`                                          |                            |
| setRepo            | `string` | CmImage | `TYPE_NOT_MATCH`                                          | repository may include also the registry part                           |
| getRepo            |          | string  | `TYPE_NOT_MATCH`                                          |                            |
| setTag             | `string` | CmImage |                                                           |                            |
| getTag             |          | string  |                                                           |                            |
| getName            |          |         |                                                           | return the raw name of the image                           |
