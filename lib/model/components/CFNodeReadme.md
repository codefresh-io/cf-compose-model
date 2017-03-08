### CFNode
Represents an object that may hold other object inside, objects may be:
 * CFNode
 * CFLeaf
 * Other JS objects
 
### Method on CFNode objects
 * Public:
    * constructor(name, data) - name of the node and data object that is  holding the other CFNodes or CFLeafs
    * getWarnings(policy) - Same as in ComposeModel
    * fixWarnings(onlyAutoFix) - same as in ComposeModel
    * actOnWarning(violation) - Create actual warning related to the node itself that cannot be identified by CFLeaf 