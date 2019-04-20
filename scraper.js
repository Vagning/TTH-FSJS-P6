//Require modules filesystem, cheerio, request, dateformat
const fs = require('fs');
const cheerio = require('cheerio');
const https = require('https');
const df = require('dateformat');
const { Parser } = require("json2csv");

//Varible for containing an array of objects, with each object containing the fields for a product
let products = [];

//the csvDelimiter variable allowsyou to change the delimiter for the csv file. This comes in handy as the US and EU does not use same standart delimiter for csv files. I know it's strange since CSV stands for "Comma-separated values"...
//I'm using semi colon as it's what is standart in a Danish excel installation. You need to change it to comma to work properly in the US.
const csvDelimiter = ";"


//Function for checking if data folder exists. It not create it. If it is nothing should be done about it. Then write csv file. M
function writeCSV(jsonData) {
	//Check if data folder exsist. If it does resolve promise. If not create it and then resolve promise.
	let dataFolder = new Promise((resolve, reject) => {
		fs.access('data', fs.constants.F_OK, (error) => {
			if (error) {
				fs.mkdirSync("./data");
				return resolve();
			} else {
				return resolve();
			}
		});

	});
	
	//When dataFolder promise has been resolved write CSV file.
	dataFolder.then(() => {
		//CSV file 
		let filename = "./data/" + df(new Date(), 'yyyy-mm-dd') + ".csv";
	 	//Varible containing the headers for csv in the right order
		const headers = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

	 	//let csvContent = json2csv.parse({ data: jsonData, fields: headers });
	 	const json2csvParser = new Parser({headers, delimiter: csvDelimiter});
		const csv = json2csvParser.parse(jsonData);

	  fs.writeFileSync(filename, csv);
	});

}

//Function with a promise for geeting links to all products
function getProducts(){
	return new Promise((resolve, reject) => {

		const url = 'https://shirts4mike.com/shirts.php';

		//request shirts4mike website and store in variable
		https.get(url, (response) => {
		  let data = '';

		  // A chunk of data has been recieved.
		  response.on('data', (chunk) => {
		    data += chunk;
		  });

		  // The whole response has been received. Print out the result.
		  response.on('end', () => {
		   	
		  	//Variable forcontaining all urls
		  	let urls = [];

		  	//load the html into cheerio for scraping
		    const $ = cheerio.load(data);
		   	//Store all product links in variable which can be used for looping over the products when scraping
		   	const productLinks = $('.products a');
		   	productLinks.each(function(index) {
		   		urls.push("https://shirts4mike.com/" + $(this).attr('href'));
		   	});

		   	return resolve(urls);
		  });

		}).on("error", (error) => {
			let errorMessage = "There's been a 404 error. Cannot connec to " + url + " - Node returned following error message: " + error.message;
		 	reject(new Error(errorMessage));
		  console.log("There's been a 404 error. Cannot connec to " + url);
		});


	});
}

function getProductInfo(url){
	return new Promise((resolve, reject) => {
		let data = '';
		https.get(url, function (response) {

			// A chunk of data has been recieved.
		  response.on('data', (chunk) => {
		    data += chunk;
		  });

		  // The whole response has been received. Print out the result.
		  response.on('end', () => {

				//If status code is 200 proceed
			  if (response.statusCode == 200) {
			  	//load the html into cheerio for scraping
					const $ = cheerio.load(data);
			  	//Object for storing all product infomation needed
			  	let productInfo = {
			  		Title: $('.shirt-details h1').clone().children().remove().end().text().trim(),
			  		Price: ($('.price').text()),
			  		ImageURL: "https://shirts4mike.com/" + ($('.shirt-picture img').attr('src')),
			  		URL: (url),
			  		Time: df(new Date(), 'yyyy-mm-dd HH:MM:ss')
			  	};

			  	return resolve(productInfo);
			  } else {
			  	let errorMessage = "There was an error when scraping the site for product info.";
		 			reject(new Error(errorMessage));
		  		console.log(errorMessage);
			  }

			});

		}).on("error", (error) => {
			let errorMessage = "There's been a 404 error. Cannot connec to " + url + " - Node returned following error message: " + error.message;
		 	reject(new Error(errorMessage));
		  console.log("There's been a 404 error. Cannot connec to " + url);
		});
		
	});

}

function getAllInfo(urls) {
	return Promise.all(urls.map(getProductInfo)).then(productInfo => {
    return productInfo;
  });
}

getProducts()
	.then(urls => {
		return getAllInfo(urls);
	})
	.then(jsonData => {
		writeCSV(jsonData)

	}).catch(error => {
		//If error occurs add it to scraper-error.log
		console.log("An error has been added to scraper-error.log");
    fs.appendFileSync("scraper-error.log", "[" +  df(new Date(), 'ddd mmm dd yyyy HH:MM:ss Z') + "] : Error: " + error.message + "\n");
  });
;









