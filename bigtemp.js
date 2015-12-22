var temp;
$(document).ready(function() {
  var apicheck;
  var chill;

  if (localStorage.getItem('api') === null || localStorage.getItem('api') == "null") {
    apicheck = false;
  } else {
    apicheck = true;
  }

  $("body").prepend('<div id="location" >make sure location is turned on</div>');


  $("#apikey").change(function() {
    if (!$("#apikey").val()) {
      localStorage.setItem('api', null);
      apicheck = false;
    } else {
      localStorage.setItem('api', $("#apikey").val());
      apicheck = true;
    }
  });


  if (localStorage.getItem('fc') === null) {
    localStorage.setItem('fc', true);
  } else {
    if (localStorage.getItem('fc') == "true") {
      updateF();
    } else {
      updateC();
    }
  }


  $("#temp").click(function() {
    $('#settings').modal({
      show: true,
      keyboard: true
    });
  });

  $("body").on('click', "#c", function() {
    localStorage.setItem('fc', false);
    updateC();
    updateTemp(temp);
    console.log("switching to SI");
  });
  $("body").on('click', "#f",function() {
    localStorage.setItem('fc', true);
    updateF();
    updateTemp(temp);
    console.log("switching to US");
  });

  $("#close").click(function() {
    $('#settings').modal('hide');
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showSucess, showError);
  } else {
    $('#temp').text("N/A");
  }

  function showSucess(pos) {
    var crd = pos.coords;
    var lat = crd.latitude;
    var lon = crd.longitude;
    var url = 'http://mysterious-headland-9915.herokuapp.com/?loc=' + lat + ',' + lon + "&callback=?";
    //var url = 'http://localhost:8888/?loc=' + lat + ',' + lon + "&callback=?";
    var urlapi = 'https://api.forecast.io/forecast/' + localStorage.getItem('api') + '/' + lat + ',' + lon + "?callback=?";

    if (apicheck) {
      $.getJSON(urlapi, function(data) {
        console.log(data);
        console.log("API " + lat + ", " + lon + " : " + Math.round(data.currently.temperature));
        updateTemp(Math.round(data.currently.temperature));
      });
    } else {
      $.getJSON(url, function(data) {
        if (data.hasOwnProperty('html')) {
          console.log("c h i l l");
          chill = data.html;
          $("body").append(chill);
        } else {
          $("body").prepend('<div id="notcold" >not cold enough?</div>');
        }
        console.log("Node " + lat + ", " + lon + " : " + data.temp);
        updateTemp(data.temp);
      });
    }
    $("#location").css("display", "none");
  }

  function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.")
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.")
        break;
    }
    $('#temp').text("N/A");
  }

 $("body").on('click', "#notcold", function() {
    //somewhere in canada
    var lat = 71.985400;
    var lon = -125.236280;
    var url = 'http://mysterious-headland-9915.herokuapp.com/?loc=' + lat + ',' + lon + "&callback=?";
   //var url = 'http://localhost:8888?loc=' + lat + ',' + lon + "&callback=?";
    console.log("not cold enough, eh?");
   $("#notcold").text("retrieving data...");
    $.getJSON(url, function(data) {
      chill = data.html;
      $("body").append(chill);
      console.log("COLD " + lat + ", " + lon + " : " + data.temp);
      updateTemp(data.temp);
      $("#notcold").text("* somewhere in canada");
    });
  });

});

function clamp(num, min, max) {
  return num < min ? min : num > max ? max : num;
}

function updateTemp(curTemp) {
  temp = curTemp;
  if (localStorage.getItem('fc') == "true") {
    $('#temp').html(temp + '&deg;F');
  } else {
    //console.log(">mfw not american");
    $('#temp').html(Math.round((temp - 32) * (5 / 9)) + '&deg;C');
  }
  var hue = 4 * clamp(curTemp, 50, 90) - 10;
  $("body").css("background-color", "hsl(" + hue + ", 50%, 50% )");
}

function updateC() {
  $("#f").removeClass("btn-success");
  $("#f").addClass("btn-danger");
  $("#c").removeClass("btn-danger");
  $("#c").addClass("btn-success");
}

function updateF() {
  $("#c").removeClass("btn-success");
  $("#c").addClass("btn-danger");
  $("#f").removeClass("btn-danger");
  $("#f").addClass("btn-success");
}
