# Yaml Flow e2e Tests

## 2e2 Tests are tests of the Compose-Model that can easy test the Compose-Model on input


#### Start using `flow.yaml`:
##### `flow.yaml` is following the same concpets as `codefresh.yml`, means that it based on steps with types. 


### Load step: `type: load`
| Name  | Type  | Additional  |
| ------------ | ------------ | ------------ |
| file  | string  | Required |
| policy  | string  | `pro` or `shared`, default is `shared` |
| on-fail  | object  | Will be invoked on loading failure |
| on-fail.message  | string  | The error message |
| on-fail.errors-content  | Array of objects | The errors of the composition |

### Translate step: `type: translate`
| Name  | Type  | Additional  |
| ------------ | ------------ | ------------ |
| to  | string  | `yaml` or `json` default is `yaml` |
| result  | mixed  | Default is `yaml`. Will change to `json` when the `to` property is `json` |

### Get-warnings step: `type: get-warnings`
| Name  | Type  | Additional  |
| ------------ | ------------ | ------------ |
| result  | Array of objects or `empty`  | Optional |

### Get-warnings step: `type: fix-warnings`
| Name  | Type  | Additional  |
| ------------ | ------------ | ------------ |
| result  | Array of objects or `empty`  | Optional |
