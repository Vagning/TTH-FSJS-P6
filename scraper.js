//Require modules filesystem, cheerio, request, dateformat
const fs = require('fs');
const cheerio = require('cheerio');
const https = require('https');
const df = require('dateformat');

//Varible containing the headers for csv in the right order
const headers = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
//Varible for containing an array of objects, with each object containing the fields for a product
let products = [];

//Function for checking if data folder exists. It not create it. If it is nothing should be done about it.
function checkOutputFolder() {
	fs.access('data', fs.constants.F_OK, (error) => {
		if (error) {
			fs.mkdirSync("./data");
		}
	});
}

//Function with a promise for geeting links to all products
function getProducts(){
	return new Promise((resolve, reject) => {
		//request shirts4mike website and store in variable
		https.get('https://shirts4mike.com/shirts.php', (response) => {
		  let data = '';

		  // A chunk of data has been recieved.
		  response.on('data', (chunk) => {
		    data += chunk;
		  });

		  // The whole response has been received. Print out the result.
		  response.on('end', () => {
		   	return resolve(data)
		  });

		}).on("error", (error) => {
		  console.log("Error: " + error.message);
		});


	});
}

function getProductInfo(html){
	return new Promise((resolve, reject) => {
		//load the html into cheerio for scraping
    const $ = cheerio.load(html);
   	//Store all product links in variable which can be used for looping over the products when scraping
   	const productLinks = $('.products a');

		productLinks.each(function() {
			const urlEnding = $(this).attr('href');
			let data = '';
			https.get('https://shirts4mike.com/'+ urlEnding, function (response) {

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
				  	let productInfo = {};

				  	//Store following info in the productInfo object: Title, Price, ImageURL, URL and timestamp
				  	productInfo.title = $('.shirt-details h1').clone().children().remove().end().text();
				  	productInfo.price = ($('.price').text());
				  	productInfo.imageurl = ($('.shirt-picture img').attr('src'));
				  	productInfo.url = ('https://shirts4mike.com/' + urlEnding);
				  	productInfo.time = df(new Date(), 'yyyy-mm-dd HH:MM:ss');

				  	products.push(productInfo);
				  	console.log(productInfo);
				  }

				});

			});
		});
		

	});
}

getProducts().then(data => {
	getProductInfo(data)
});









