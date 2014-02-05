
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

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
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

var url = "http://m.saavn.com/Weekly+Top+Songs/songs_PL-ltIYSNe0er0_.html?lang=hindi";
var starting_list = "<div class=\"section\">    ", 
	ending_list="</div><!-- google_afm -->";

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

	//Get list of top 15 songs
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
		console.dir("PORTION #" + i  + ": " + songs[i]);
	}

	//Send request to Bollywood API for each song in songs array
	// var private_key = 'cfd2d4b1e7bee9ff103656af5e49b03c';
	// var crypto = require("crypto");
	// var OAuth2 = require('mashape-oauth').OAuth2;
	// var oa = new OAuth2();
	// var hash_hmac = crypto.createHmac('sha256', private_key);

	// for(var i = 0; i < songs.length; i++) {
	// 	var song_request = "/song/" + songs[i] + "?DeveloperID=5a9b85fd&Version=1.0";
	// 	var song_url = "http://www.bollywoodapi.com/v1/search" + song_request;

	// 	function generateHmac (data, private_key, algorithm, encoding) {
	// 	  encoding = encoding || "base64";
	// 	  algorithm = algorithm || "sha256";
	// 	  return crypto.createHmac(algorithm, private_key).update(data).digest(encoding);
	// 	}
	// 	var rfc2104Hmac = generateHmac(song_request, private_key);
	// 	console.dir(rfc2104Hmac);

	// 	var options = {
	// 		'clientId': "5a9b85fd",
	// 		'clientSecret': private_key,
	// 		'baseUrl': song_url,
	// 		'headers': rfc2104Hmac
	// 	};
	// 	var callback;
	// 	oa.get(options, console.dir("error"));

	// 	// request({
	// 	// 	uri: song_url,
	// 	// 	header: { 'hmac': rfc2104Hmac }
	// 	// 	}, function(error, response, body) {
	// 	// 		console.dir("Song info: " + body);
	// 	// });
	// }
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
