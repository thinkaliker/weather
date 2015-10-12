var http = require("http");
var url = require("url");
var fs = require("fs");
var https = require("https");
var request = require("request");
var api;

//Provide your own API key
fs.readFile('./api.key', 'utf8', function(err, data) {
  if (err) {
    return console.error(err);
  }
  api = data;
});

http.createServer(function(req, res) {
  var query = url.parse(req.url, true).query;

  loc = query.loc;
  var temperature;

  //Fetch from forecast.io
  var fetchurl = 'https://api.forecast.io/forecast/' + api + '/' + loc;
  request(fetchurl, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      temperature = (Math.round(data.currently.temperature));
      console.log(loc + " : " + temperature);
    } else {
      temperature = "N/A";
    }

    var json = JSON.stringify({
      "temp": temperature
    });

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    if (query.callback) {
      res.write(query.callback + '(' + json + ');');
    } else {
      res.write(json);
    }
    res.end();

  });

}).listen(8888);
