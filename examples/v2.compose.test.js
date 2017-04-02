const path         = require('path');
const CM           = require('../index');
const ComposeModel = CM.ComposeModel;
const Service      = CM.components.Service;
const kefir        = require('kefir');
const _            = require('lodash');
let format = (data)=>{
  const prettyjson = require('prettyjson');
   console.log(prettyjson.render(data));
  return prettyjson.render(data);;
}
let showAsTable = (model)=>{
  var Table = require('cli-table');

// instantiate
let cols = new Array(model.warnings[0].length);
var table = new Table({
    head: _.keys(model.warnings[0]),
    colWidths: cols
});

_.fill(cols, 20);
_.map(model.warnings,(v)=>{
  table.push(_.values(v));
})

console.log(table.toString());
}
describe('test some user cases realted to v2', ()=>{
  let compose;
  debugger;
  it.only('check warinings', ()=>{
    const locations = [
      //path.resolve(__dirname, "./docker-compose.v2.yml"),
      path.resolve(__dirname, "./docker-compose.v2.vote-app.yml")];
     
      let parseStream = kefir.sequentially(0, locations)
        .flatMap(
        (location)=>kefir.fromPromise(ComposeModel.load(location, CM.policies.pro))).log();
      //  .flatMap((cm)=>kefir.fromPromise(cm.translate(CM.translators.ComposeV2)
      //  .then(()=>cm))).log();
      parseStream.onValue((v)=>v.getErrorsAndWarnings());

      let warningsStream = parseStream
      .flatMap((model)=>{
         console.log('print model:' + format(model));
         return kefir.fromPromise(model.getErrorsAndWarnings())
      }).log();

      //warningsStream.onValue((v)=>showAsTable(v));



  })
  it('v2 shared policy', (done)=>{
    const locations = [
      path.resolve(__dirname, "./docker-compose.v2.yml"),
      path.resolve(__dirname, "./docker-compose.v2.vote-app.yml")]

  let parseStream = kefir.sequentially(0, locations)
    .flatMap(
    (location)=>kefir.fromPromise(ComposeModel.load(location)))
    .flatMap((cm) => {
            compose = cm;
            return kefir.fromPromise(cm.translate(CM.translators.ComposeV2))
        })
    .flatMap((translated)=>{
            console.log(translated);
            let stream =  kefir.fromPromise(compose.getErrorsAndWarnings()).map((v)=>{
              return v;
            })
             return stream;
        });


    parseStream.onEnd(done);
    parseStream.flatMap(format).onValue(console.log);

    })

    it('v2 Pro policy', (done)=>{
      const location = path.resolve(__dirname, "./docker-compose.v2.yml");

     let parseStream = kefir.fromPromise(ComposeModel.load(location)).flatMap((cm) => {
              compose = cm;
              return kefir.fromPromise(cm.translate(CM.translators.ComposeV2))
          }).flatMap((translated)=>{
              console.log(translated);
              let stream =  kefir.fromPromise(compose.getErrorsAndWarnings()).map((v)=>{
                return v;
              })
               return stream;
          });


      parseStream.onEnd(done);
      parseStream.flatMap(format).onValue(console.log);

      })


});
