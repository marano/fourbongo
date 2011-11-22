var foursquare = function () {
  var pvt = { token: null };
  var api = {};

  api.initialize = function () {
    var isFoursquareCallback = $('meta[name=from_foursquare_authentication_callback]').attr('content') == 'true';

    if (isFoursquareCallback) {
      var token = window.location.hash.replace('#access_token=', '');
      window.history.pushState(0, '', '/');
      $.cookie('foursquare_token', token, {path: '/', expires: 365});
      pvt.token = token;
    } else {
      var token = $.cookie('foursquare_token');
      pvt.token = token;
    }
  };

  api.isAuthenticated = function () { return pvt.token != null };

  api.search_venues_by_name_and_city = function (name, city, callback) {
    $.getJSON('/venues/search_by_name_and_city/' + encodeURIComponent(name) + '/' + encodeURIComponent(city), callback);
  };
  
  api.search_venues_by_location = function (latitude, longitude, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/search?v=20111117&ll=' + latitude + ',' + longitude + '&radius=1000&intent=browse&limit=50&oauth_token=' + pvt.token, function (data) {
      var venues = _(data.response.venues).map(function (venue) {
        return {foursquare_id: venue.id, name: venue.name};
      });
      callback(venues);
    });
  };

  api.venue = function (venueId, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/' + venueId + '?oauth_token=' + pvt.token + '&v=20111118', function (data) {
      var name = data.response.venue.name;
      var latitude = data.response.venue.location.lat;
      var longitude = data.response.venue.location.lng;
      callback({id: venueId, name: name, latitude: latitude, longitude: longitude});
    });
  };

  api.herenow = function (venueId, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/' + venueId + '/herenow?oauth_token=' + pvt.token + '&v=20111118', function (data) {
      var userIds = _(data.response.hereNow.items).map(function (checkin) { return checkin.user.id; });
      callback(userIds);
    });
  };

  api.profile = function (userId, callback) {
    $.getJSON('https://api.foursquare.com/v2/users/' + userId + '?oauth_token=' + pvt.token + '&v=20111118', function (data) { callback({twitter: data.response.user.contact.twitter, facebook: data.response.user.contact.facebook}); });
  };

  api.login = function () {
    window.location = 'https://foursquare.com/oauth2/authenticate?client_id=GBFO0NELBGW0SEP2BGDY1KID00VO45TGNTJQ4OZHVJKIFP5Z&response_type=token&redirect_uri=' + encodeURI('http://fourbongo.com/foursquare/authentication_callback');
  };

  return api;
}();
