var bee = require("./beeline");
var sys = require("util");
var fs = require("fs");
var path = require("path");
var url = require("url");
var qs = require("querystring");

var router = bee.route({
	"r`/Search`" : function(req, res, matches) {
		var query = url.parse(req.url, true)['query']["q"];
		res.statusCode = 200;
		var control = require("./controller/Topics");
		res.write(
			JSON.stringify(
				control.search(query)
			)
		);
		res.end();
	},
	"r`/Files(/.*)|/Files`" : function(req, res, matches) {
		var control = require("./controller/Files");
		if ( matches[0] ) {
			switch ( req.method ) {
				case "DELETE" :
						res.write(
							JSON.stringify(
								control.del(matches[0])
							)
						);	
						res.end();
				break;
				case "POST" :
					var body;
					req.on('data', function (data) {
						body += data;
					});
					req.on('end', function () {
						var UPDATE = qs.parse(body);
						res.write(
							JSON.stringify(
								control.update(matches[0], UPDATE['undefinednewfilename'])
							)
						);	
						res.end();
					});
				break;
				case "GET" :
				default:
					res.write(
							JSON.stringify(
								control.get(matches[0])
							)
						);		
					res.end();
				break;
			}
		} else {
			res.write(
					JSON.stringify(
						control.put(req, res)
					)
				);
			res.end();
		}
	},
	"r`/Topics(/.*)/TOC`" : function(req, res, matches) {
		res.statusCode = 200;
		var control = require("./controller/Topics");

				var data = control.getToc();
				res.write(
					JSON.stringify(
						data
					)
				);
		
		res.end();
	},
	"r`/Topics(/.*)|/Topics`" : function(req, res, matches) {
		res.statusCode = 200;
		var control = require("./controller/Topics");
		switch ( req.method ) {
			case "DELETE" :
				res.write(
					JSON.stringify(
						control.del(matches[0])
					)
				);				
				break;
			case "POST" :
				var body = '';
				req.on('data', function (data) {
					body += data;
				});
				req.on('end', function () {

					var POST = qs.parse(body);
					res.write(
					JSON.stringify(
						control.post(POST["newFile"], POST["content"], POST["meta"])
					)
					);
				});
				
				break;
			case "GET" :
			default :
				var data = control.get(matches[0]);
				res.write(
					JSON.stringify(
						data
					)
				);
		}
		res.end();
	},
	"/": function(req, res) {
		res.statusCode = 200;
		filename = path.join(process.cwd(), "public");
		filename = path.join(filename, "404.html");
		console.log("404");
		fs.readFile(filename, "binary", function(err, file) {
			if ( !err ) {
				sys.puts("GET Static File " + filename);
				res.statusCode = 200;
				res.write(file, "binary");
				res.end();
			} else {
				res.end();
			}
		});
	},
	"r`(.*)`" : function(req, res, matches) { // files
		var uri = url.parse(req.url).pathname;
		var filename = path.join(process.cwd(), "public");
		filename = path.join(filename, uri);
		path.exists(filename, function(exists) {
			fs.readFile(filename, "binary", function(err, file) {
				if ( !err ) {
					sys.puts("GET Static File " + filename);
					res.statusCode = 200;
					res.write(file, "binary");
					res.end();
				} else {
					res.end();
				}
			});
		});
	},

});
require("http").createServer(router).listen(8001);
sys.puts("Server is listening");