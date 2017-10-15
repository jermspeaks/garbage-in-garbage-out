const csvFilePath='./data/CleanedMatrixTransposed.csv';
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
	    fs.appendFile('rdata.json', JSON.stringify(final), (err) => {
		  if (err) throw err;
		});
	})