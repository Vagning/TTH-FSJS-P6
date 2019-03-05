//Require modules filesystem, cheerio, request
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

//request shirts4mike website and store in variable
request('https://shirts4mike.com/', function (error, response, html) {
	//If there is no error and status code is 200 proceed
  if (!error && response.statusCode == 200) {
    //load the html into cheerio for scraping
    const $ = cheerio.load(html);
    //Debuggin
    //console.log($(".button"));

    fs.access('data', fs.constants.F_OK, (error) => {
		  console.log(`Data ${error ? 'does not exist' : 'exists'}`);
		});


  }
});

