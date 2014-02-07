
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var request = require("request");
var path = require('path');

var app = express();

var jshare = require('jshare');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(jshare());
app.use(express.favicon());
app.use(express.logger('dev')); 
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var http = require('http');
var request = require("request");

var url = "http://m.saavn.com/Weekly+Top+Songs/songs_PL-ltIYSNe0er0_.html?lang=hindi";
var starting_list = "<div class=\"section\">    ", 
	ending_list="</div><!-- google_afm -->";
var filter = "<p class=\"row \">\n        \n        <strong>";
var private_key = 'cfd2d4b1e7bee9ff103656af5e49b03c';
var crypto = require("crypto");

var songs = new Array();
var output_list = new Array();
var saavn = new String(), starting_index = 0, ending_index = 0;

request({
	uri: url,
	}, function(error, response, body) {
	var starting_index = body.indexOf(starting_list);
	var ending_index = body.indexOf(ending_list);

	console.dir(starting_index + " " + ending_index);

	if(starting_index == -1 || ending_index == -1) { 
	  console.log("ERROR: starting or ending indices not found");
	  console.dir(body);
	  return;
	}

	// Get list of top 15 songs
	var list_html = body.substring(starting_index + starting_list.length, ending_index);
	var songs = new Array();
	var filter = "<p class=\"row \">\n        \n        <strong>";

	var list = list_html.split(filter);
	for(var i = 1; i < list.length; i++) {
		ending_index = list[i].indexOf("</strong>");
		if(ending_index == -1) {
			console.log("ERROR: didn't find it...");
		}
		songs[i] = list[i].substr(0, ending_index);
		console.dir("#" + i  + ": " + songs[i]);
	}

	//Send request to Bollywood API for each song in songs array
	var private_key = 'cfd2d4b1e7bee9ff103656af5e49b03c';
	var crypto = require("crypto");

	for(var i = 0; i < songs.length; i++) {
		var song_request = "/v1/search/songs/" + songs[i] + "?DeveloperID=5a9b85fd";
		var song_path = "www.bollywoodapi.com/v1/search" + song_request;
		var hash_hmac = crypto.createHmac('sha256', private_key);
		var rfc2104Hmac = hash_hmac.update(new Date().getTime().toString()).digest('base64');

		var options = {
			hostname: 'www.bollywoodapi.com',
			path: song_request,
			headers: { 'hmac': rfc2104Hmac }
		};
		console.dir("HEADERS: " + JSON.stringify(options.headers));

		var req = new http.request(options, function(res) {
		  console.log('STATUS: ' + res.statusCode);
		  console.log('HEADERS: ' + JSON.stringify(res.headers));
		  res.setEncoding('utf8');
		  res.on('data', function (chunk) {
		    console.log('BODY: ' + chunk);
		  });
		});
		req.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});
		req.write('data\n');
		req.write('data\n');
		req.end();
	}
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(req, res){
  console.log('Express server listening on port ' + app.get('port'));
});
