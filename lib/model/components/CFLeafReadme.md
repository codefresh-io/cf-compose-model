### CFNode
Represents an object that hold some value.
All Leafs shoud 
### Method on CFNode objects
 * Objects:
    * parentFieldName: String that is the name of parent
 * Public:
    * toString() - get the final result that can be sen used outside of the model
    * getWarnings(policy) - same as ComposeModel
    * fixWarning(onlyAutoFix) - same as ComposeModel
 * Static:
    * parse(stringValue, parentFieldName) - return instance of the current leaf
 * Builder: Each leaf has builder class that helps to create instances of the current leaf

