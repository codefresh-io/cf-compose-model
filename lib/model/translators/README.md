### Create a your translator

* Define your class that extends `Base`, see example im `translators/ComposeV1` 
    * Class must have method `_toJson` that will be called by the  with the compose object
* Add your logic to `CFComposeModel.js` in method `getTranslatorForYaml`
    