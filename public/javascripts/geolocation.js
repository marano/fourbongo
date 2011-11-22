var geolocation = function () {
  var api = {};

  api.fetch = function (callback) {
    navigator.geolocation.getCurrentPosition(function (position) {
      callback(position.coords.latitude, position.coords.longitude);
    });
  };

  api.city = function (latitude, longitude, callback) {
    navigator.geolocation.getCurrentPosition(function (position) {
      $.getJSON('http://nominatim.openstreetmap.org/reverse?format=json&lat=' + latitude + '&lon=' + longitude + '&addressdetails=1', function (data) {
        callback(data.address.city);
      });
    });
  };
  
  return api;
}();
