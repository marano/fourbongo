var foursquare = function () {
  var api = {};

  api.search_venues_by_name_and_city = function (name, city, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/search?v=20111117&query=' + encodeURIComponent(name) + '&near=' + encodeURIComponent(city) + '&limit=50&oauth_token=' + foursquareNetwork.token() + '&callback=?', function (data) {
      var venues = _(data.response.venues).map(function (venue) {
        return {foursquare_id: venue.id, name: venue.name};
      });
      callback(venues);
    });
  };
  
  api.search_venues_by_location = function (latitude, longitude, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/search?v=20111117&ll=' + latitude + ',' + longitude + '&radius=1000&intent=browse&limit=50&oauth_token=' + foursquareNetwork.token() + '&callback=?', function (data) {
      var venues = _(data.response.venues).map(function (venue) {
        return {foursquare_id: venue.id, name: venue.name};
      });
      callback(venues);
    });
  };

  api.venue = function (venueId, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/' + venueId + '?oauth_token=' + foursquareNetwork.token() + '&v=20111118&callback=?', function (data) {
      var name = data.response.venue.name;
      var latitude = data.response.venue.location.lat;
      var longitude = data.response.venue.location.lng;
      callback({id: venueId, name: name, latitude: latitude, longitude: longitude});
    });
  };

  api.herenow = function (venueId, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/' + venueId + '/herenow?oauth_token=' + foursquareNetwork.token() + '&v=20111118', function (data) {
      var userIds = _(data.response.hereNow.items).map(function (checkin) { return checkin.user.id; });
      callback(userIds);
    });
  };

  api.profile = function (userId, callback) {
    $.getJSON('https://api.foursquare.com/v2/users/' + userId + '?oauth_token=' + foursquareNetwork.token() + '&v=20111118', function (data) { callback({twitter: data.response.user.contact.twitter, facebook: data.response.user.contact.facebook}); });
  };

  api.login = function () {
    var client_id = $('meta[name=foursquare_client_id]').attr('content');
    window.location = 'https://foursquare.com/oauth2/authenticate?client_id=' + client_id + '&response_type=token&redirect_uri=' + encodeURI(window.location.protocol + "//" + window.location.host + '/foursquare/authentication_callback');
  };

  return api;
}();

