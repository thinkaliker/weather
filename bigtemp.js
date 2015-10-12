$(document).ready(function() {
  var temp = 9999;
  if (localStorage.getItem('fc') === null) {
    console.log("first");
    localStorage.setItem('fc', true);
  } else {
    if (localStorage.getItem('fc') == "true") {
      console.log("existing F");
      updateF();
    } else {
      console.log("existing C");
      updateC();
    }
  }


  $("#temp").click(function() {
    $('#settings').modal({
      show: true,
      keyboard: true
    });
  });

  $("#c").click(function() {
    localStorage.setItem('fc', false);
    updateC();
    if (temp != 9999) {
      updateTemp(temp);
    }
  });
  $("#f").click(function() {
    localStorage.setItem('fc', true);
    updateF();
    if (temp != 9999) {
      updateTemp(temp);
    }
  });

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

  function updateTemp(curTemp) {
    temp = curTemp;
    if (localStorage.getItem('fc')) {
      $('#temp').html(temp + '&deg;F');
    } else {
      //console.log(">mfw not american");
      $('#temp').html(Math.round((temp - 32) * (5 / 9)) + '&deg;C');
    }
  }


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
    var url = 'http://node.thinkaliker.com:8888/?loc=' + lat + ',' + lon + "&callback=?";

    $.getJSON(url, function(data) {
      console.log(lat + ", " + lon + " : " + data.temp);
      updateTemp(data.temp);
    });
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
});
