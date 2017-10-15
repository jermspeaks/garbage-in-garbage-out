var request = require('request');
var cities = [
	"AlbanyNY",
	"AtlantaGA",
	"AustinTX",
	"BaltimoreMD",
	"BatonRougeLA",
	"BeaumontTX",
	"BirminghamAL",
	"BostonMA",
	"BuffaloNY",
	"CharlestonSC",
	"CharlotteNC",
	"ChicagoIL",
	"CincinnatiOH",
	"ClevelandOH",
	"ColumbusOH",
	"CorpusChristiTX",
	"DallasTX",
	"DaytonOH",
	"DenverCO",
	"DetroitMI",
	"ElPasoTX",
	"FortWayneIN",
	"FresnoCA",
	"GrandRapidsMI",
	"GreensboroNC",
	"GreenvilleSC",
	"HartfordCT",
	"HoustonTX",
	"IndianapolisIN",
	"JacksonvilleFL",
	"KansasCityMO",
	"KnoxvilleTN",
	"LakeCharlesLA",
	"LaredoTX",
	"LasVegasNV",
	"LosAngelesCA",
	"Louisville/JeffersonCountyKY",
	"MemphisTN",
	"MiamiFL",
	"MilwaukeeWI",
	"MinneapolisMN",
	"MobileAL",
	"NashvilleTN",
	"NewOrleansLA",
	"NewYorkNY",
	"OklahomaCityOK",
	"OmahaNE",
	"OrlandoFL",
	"PhiladelphiaPA",
	"PhoenixAZ",
	"PittsburghPA",
	"PortlandOR",
	"RaleighNC",
	"otherAL",
	"otherAK",
	"otherAZ",
	"otherAR",
	"otherCA",
	"otherCO",
	"otherCT",
	"otherDE",
	"otherFL",
	"otherGA",
	"otherHI",
	"otherID",
	"otherIL",
	"otherIN",
	"otherIA",
	"otherKS",
	"otherKY",
	"otherLA",
	"otherME",
	"otherMD",
	"otherMA",
	"otherMI",
	"otherMN",
	"otherMS",
	"otherMO",
	"otherMT",
	"otherNE",
	"otherNV",
	"otherNH",
	"otherNM",
	"otherNY",
	"otherNC",
	"otherND",
	"otherOH",
	"otherOK",
	"otherOR",
	"otherPA",
	"otherSC",
	"otherSD",
	"otherTN",
	"otherTX",
	"otherUT",
	"otherVT",
	"otherVA",
	"otherWA",
	"otherWV",
	"otherWI",
	"otherWY",
	"RichmondVA",
	"RochesterNY",
	"SacramentoCA",
	"SaltLakeCityUT",
	"SanAntonioTX",
	"SanDiegoCA",
	"SanJoseCA",
	"SavannahGA",
	"SeattleWA",
	"St.LouisIL",
	"TampaFL",
	"TucsonAZ",
	"TulsaOK",
	"UrbanHonoluluHI",
	"VirginiaBeachVA",
	"WashingtonDC",
	"WichitaKS"
]

// "thisStringIsGood"
//     // insert a space before all caps
//     .replace(/([A-Z])/g, ' $1')
//     // uppercase the first character
//     .replace(/^./, function(str){ return str.toUpperCase(); })

var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBYaoNCL8ASmM9wGA-24VrriYZn1vOHrpM'
});

var result = [];

const fs = require('fs');

var promise = new Promise((resolve, reject) => {
	var converted = cities.forEach(city => {
		var length = city.length;
		var sliceLength = length - 2;

		var name = city.slice(0, sliceLength).replace(/([A-Z])/g, ' $1').replace(/^\s/, '');
		var state = city.slice(sliceLength);
		// console.log('name', name);
		// console.log('state', state);

		var address = name === 'other' ? `${state}, USA` : `${name}, ${state}, USA`;

		googleMapsClient.geocode({
		  address: address
		}, function(err, response) {
		  if (!err) {
		  	results = response.json.results;
		  	if (results[0]) {
		  		var location = results[0].geometry.location;
		  		var lat = location.lat;
		  		var long = location.lng;
		  		fs.appendFile('data.csv', `\n${city},"${address}",${lat},${long}`, (err) => {
				  if (err) throw err;
				  console.log(`${city}, ${address}, ${lat}, ${long}`);
				});
		  	} else {
		  		fs.appendFile('data.csv', `\n${city},"${address}"`, (err) => {
				  if (err) throw err;
				  console.log(`${city}, ${address}`);
				});
		  	}
		  }
		});
	});
});

