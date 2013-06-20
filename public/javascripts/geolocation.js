var geolocation = function () {
  var api = {};

  api.fetch = function (callback) {
    navigator.geolocation.getCurrentPosition(function (position) {
      callback(position.coords.latitude, position.coords.longitude);
    });
  };

  api.city = function (latitude, longitude, callback) {
    navigator.geolocation.getCurrentPosition(function (position) {
      reverse(latitude, longitude, function (data) {
        callback(data.address.city);
      });
    });
  };

  api.displayName = function (latitude, longitude, callback) {
    reverse(latitude, longitude, function (data) {
      var name = _([data.address.road, data.address.state_district, data.address.city, data.address.country]).select(function (address) { return address && address !== ''; }).join(', ');
      callback(name);
    });
  };

  function reverse(latitude, longitude, callback) {
    $.getJSON('http://nominatim.openstreetmap.org/reverse?format=json&lat=' + latitude + '&lon=' + longitude + '&addressdetails=1', function (data) {
      if (!data.error) {
        callback(data);
      }
    });
  }
  
  return api;
}();
