//Require modules filesystem, cheerio, request, dateformat
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const df = require('dateformat');

//Varible containing the headers for csv in the right order
const headers = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
//Varible for containing an array of objects, with each object containing the fields for a product
let products = [];

//Check if data folder exists. It not create it. If it is nothing should be done about it.
fs.access('data', fs.constants.F_OK, (error) => {
	if (error) {
		fs.mkdirSync("./data");
	} 
});

//request shirts4mike website and store in variable
request('https://shirts4mike.com/shirts.php', function (error, response, html) {
	//If there is no error and status code is 200 proceed
  if (!error && response.statusCode == 200) {
    //load the html into cheerio for scraping
    const $ = cheerio.load(html);
   	//Store all product links in variable which can be used for looping over the products when scraping
   	const productsLinks = $('.products a');
   	
   	//Loop over all products. Get link from html. Request html of new page and scraped wanted data.
		for (var i = 0; i < productsLinks.length; i++) {
			const urlEnding = $(productsLinks[i]).attr('href');
			request('https://shirts4mike.com/'+ urlEnding, function (error, response, html) {
				//If there is no error and status code is 200 proceed
			  if (!error && response.statusCode == 200) {
			  	//load the html into cheerio for scraping
    			const $ = cheerio.load(html);
			  	//Object for storing all product infomation needed
			  	let productInfo = {};

			  	//Store following info in the productInfo object: Title, Price, ImageURL, URL and timestamp
			  	productInfo.title = $('.shirt-details h1').clone().children().remove().end().text();
			  	productInfo.price = ($('.price').text());
			  	productInfo.imageurl = ($('.shirt-picture img').attr('src'));
			  	productInfo.url = ('https://shirts4mike.com/' + urlEnding);
			  	productInfo.time = df(new Date(), 'yyyy-mm-dd HH:MM:ss');

			  	products.push(productInfo);
			  	console.log(i, productInfo);
			  }
			});

		} 


		


  }
});

