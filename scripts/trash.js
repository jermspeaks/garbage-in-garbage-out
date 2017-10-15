// var fs = require('fs');
// var parse = require('csv-parse');
// var transform = require('stream-transform');

// var output = [];
// var parser = parse()
// var input = fs.createReadStream('./data/CleanedMatrix.csv');

// var transformer = transform(function(record, callback){
//   setTimeout(function(){
//     // callback(null, record.join(' ')+'\n');
//     callback(null, record.toString()+'\n');
//   }, 500);
// }, {parallel: 10});

// input.pipe(parser).pipe(transformer).pipe(process.stdout);
// 
// 
const csvFilePath='./data/CleanedMatrix.csv';
const csv=require('csvtojson');
const fs = require('fs');
const final = [];
csv()
	.fromFile(csvFilePath)
	.on('json',(jsonObj)=>{
		for (var k in jsonObj) {
			if (jsonObj.hasOwnProperty(k)) {
				if (jsonObj[k] === '0' || jsonObj[k] === '') {
					delete jsonObj[k];
				}
			}
		}
		final.push(jsonObj);
	    // combine csv header row and csv line to a json object
	    // jsonObj.a ==> 1 or 4
	})
	.on('done',(error)=>{
	    fs.appendFile('data.json', JSON.stringify(final), (err) => {
		  if (err) throw err;
		});
	})