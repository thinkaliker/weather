var http = require("http");
var url = require("url");
var fs = require("fs");
var https = require("https");
var request = require("request");
var firebase = require("firebase");
var timestamp = require('log-timestamp');
var ref = new firebase("https://radiant-torch-9623.firebaseio.com/");
var api;
var bing;
var load;

console.log("Server started!");

//Provide your own API key
fs.readFile('./api.key', 'utf8', function(err, data) {
  if (err) {
    return console.error(err);
  }
  api = data;
});

fs.readFile('./bing.key', 'utf8', function(err, data) {
  if (err) {
    return console.error(err);
  }
  bing = data;
});

fs.readFile('./load.html', 'utf8', function(err, data) {
  if (err) {
    return console.error(err);
  }
  load = data;
});

function fetchPostalCode(callback, location, bing) {
  //fetch postal code from Bing
  //https://msdn.microsoft.com/en-us/library/ff701710.aspx
  var bingurl = 'http://dev.virtualearth.net/REST/v1/Locations/' + location + '?key=' + bing;
  request(bingurl, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      try{
        var bingdata = JSON.parse(body);
      } catch (e) {
        return console.error(e);
      }
      console.log(bingdata);

      var parse2 = JSON.stringify(bingdata);
      var parse = JSON.parse(parse2);

      //console.log(parse);
      console.log(parse.resourceSets[0]);
      var postal = parse.resourceSets[0].resources[0].address.postalCode;

      //      console.log("POSTAL: " + postal);
    } else {
      console.log("LOC: " + location + " // error retrieving postal");
      postal = "00000"
    }
    callback(postal);
  });
}

function fetchForecast(callback, location, tempref, foundpostal) {
  //Fetch from forecast.io
  var fetchurl = 'https://api.forecast.io/forecast/' + api + '/' + location;
  request(fetchurl, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);

      //set firebase
      var time = new Date().getTime();
      data.timestamp = time;
      //console.log(data);
      var tempobj = {};
      tempobj[foundpostal] = data;
      tempref.child(foundpostal).set(data);

      temperature = (Math.round(data.currently.temperature));
      console.log(location + " : " + temperature);
    } else {
      temperature = "N/A";
    }
    callback(temperature);
  });
}

function fetchFirebase(callback, postal, ref, location) {
  temp = ref.child("" + postal + "");
  temp.once('value', function(snapshot) {
      //https://radiant-torch-9623.firebaseio.com/
      var currTime = new Date().getTime();
      if (currTime - snapshot.child("timestamp").val() > 3600000) {
        console.log("update weather info " + snapshot.child("timestamp").val());
        fetchForecast(function(temperature){
          callback(temperature)
        } ,location, ref, postal);

      } else {

        var temperature = Math.round(snapshot.child("currently").child("temperature").val());
        //console.log("snapshot " + snapval);
        //var temperature = snapshot.currently.temperature;
        console.log(postal + " : " + location + " : " + temperature);
        callback(temperature);
      }

    },
    function(err) {
      console.log("err " + err);
      callback("ERR");
    }
  );

}

function writeJSON(temperature, res, query) {
  var json;
  if (temperature > "55") {
    json = JSON.stringify({
      "temp": temperature
    });
  } else {
    var html = load;
    json = JSON.stringify({
      "temp": temperature,
      "html": html
    })
  }

  res.writeHead(200, {
    "Content-Type": "application/json"
  });

  if (query.callback) {
    res.write(query.callback + '(' + json + ');');
  } else {
    res.write(json);
  }
  res.end();
}

http.createServer(function(req, res) {
  var query = url.parse(req.url, true).query;
  location = query.loc;
  var tempref = ref;

  fetchPostalCode(function(foundpostal) {
    tempref.once('value', function(snapshot) {
      if (!snapshot.hasChild(foundpostal)) {

        fetchForecast(function(temperature) {
          writeJSON(temperature, res, query);
        }, location, tempref, foundpostal);

      } else {
        var postalref = tempref + "/" + foundpostal;
        console.log("POSTAL: " + foundpostal + " exists already");

        fetchFirebase(function(temperature) {
          writeJSON(temperature, res, query);
        }, foundpostal, tempref, location);

      }

    });
  }, location, bing);


}).listen(8888);
