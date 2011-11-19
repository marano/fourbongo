var foursquare = function () {
  var api = {};
  
  api.venue = function (venueId, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/' + venueId + '?oauth_token=YN1YTMIQU0S1KLYILLFQNQQIX5WTBZBRWW1Z2YBTLSBMJAR5&v=20111118', function (data) {
      var name = data.response.venue.name;
      var latitude = data.response.venue.location.lat;
      var longitude = data.response.venue.location.lng;
      callback({name: name, latitude: latitude, longitude: longitude});
    });
  };

  return api;
}();

var page = function () {
  var api = {};

  api.showLoading = function () {
    $('<div>', {id:'loading'}).css('opacity', '.0').html('L<img src="/radar.gif" />ading').appendTo($('#container')).animate({'opacity' : '.6'}, {easing: 'easeOutQuint', duration: 1000});
  };

  api.hideLoading = function () { $('#loading').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () { $('#loading').remove(); }}); };

  api.coverHtml = function (venueName) { return $('<div>', {id: 'venue_cover'}).text(venueName); };

  api.mapContainerHtml = function () { return $('<div>', {id:'venue_map'}); };

  api.mapCanvasHtml = function () {
    var width = $(document).width();
    var height = $(document).height();
    return $('<div>', {id:'map_canvas'}).css('width', width + 'px').css('height', height + 'px');
  };

  api.mapCanvasDocumentElement = function () { return document.getElementById('map_canvas'); };

  return api;
}();

var map = function () {
  var api = {};
  
  api.show = function (latitude, longitude, slider) {
    var mapContainer = page.mapContainerHtml();
    var mapCanvas = page.mapCanvasHtml();
    mapCanvas.appendTo(mapContainer);
    
    slider.slide(mapContainer, function () {
      var myOptions = {
        zoom: 21,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        center: new google.maps.LatLng(latitude, longitude),
        mapTypeControl: false,
        overviewMapControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false
      };

      var map = new google.maps.Map(page.mapCanvasDocumentElement(), myOptions);
    });
  };

  return api;
}();

var introduction = function () {
  var api = {};

  api.showCover = function (venueName, slider) {
    slider.slide(page.coverHtml(venueName));
  };

  api.showMap = function (latitude, longitude, slider) {
    map.show(latitude, longitude, slider);
  };

  return api;
}();

var wall = function () {
  var api = {};
  var pvt = {};

  api.initialize = function (venueId) {
    foursquare.venue(venueId, pvt.startShow);
  };

  pvt.startShow = function (venue) {
    var slider = slideShow($('#container'));

    introduction.showCover(venue.name, slider);
    setTimeout(page.showLoading, 1000);
    setTimeout(function () { introduction.showMap(venue.latitude, venue.longitude, slider); }, 2000);
  };

  return api;
}();


$(function () {
  var venueId = $('meta[name=venueId]').attr("content");
  wall.initialize(venueId);
});
