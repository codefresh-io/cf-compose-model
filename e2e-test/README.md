# Yaml Flow e2e Tests

## e2e tests used to execute flow on the Compose-Model based on input file.

#### Start using `flow.yaml`:
##### `flow.yaml` is following the same concpets as `codefresh.yml`, means that it based on steps with types. 

##### run all e2e-test: `yarn run e2e-test`

#### e2e-example
`flow.yaml`
```yaml

# The test name
name: 'Should parse compose v1 and translate it. The result should be the same'

steps:
  # path should be relative to current dir
  load-composition-step:
    type: load
    file: ./docker-compose.yaml
    
  # translate the compose and test it agains the result  
  translate-to-yaml:
    type: translate
    result:
      os:
        image: ubuntu
        ports:
          - '80:80'
```

`docker-compose.yaml`

```yaml
os:
  image: ubuntu
  ports:
    - '80:80'
```


## Steps documentation
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
| print  | boolean  | if set to `true` will print the final translation |
| result  | mixed  | Default is `yaml`. Will change to `json` when the `to` property is `json` |

### Get-warnings step: `type: get-warnings`
| Name  | Type  | Additional  |
| ------------ | ------------ | ------------ |
| result  | Array of objects or `empty`  | Optional |
| print  | boolean  | if set to `true` will print the final translation |


### Get-warnings step: `type: fix-warnings`
| Name  | Type  | Additional  |
| ------------ | ------------ | ------------ |
| result  | Array of objects or `empty`  | Optional |



