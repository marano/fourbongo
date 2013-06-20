var foursquareNetwork = function () {
  var api = {};

  api.token = function () {
    return $.cookie('foursquare_access_token');
  };

  api.isAuthenticated = function () {
    return $.cookie('foursquare_authenticated') == 'true';
  };

  api.isFoursquareCallback = function () {
    return $('meta[name=from_foursquare_authentication_callback]').attr('content') == 'true';
  }

  api.login = function () {
    window.location = '/auth/foursquare';
  };

  return api;
}();

var SocialNetwork = function (networkName) {
  var api = {};

  function cookieName() {
    return networkName + '_authenticated';
  }

  function isAuthenticated() {
    return $.cookie(cookieName()) == 'true';
  }

  api.initialize = function () {
    updateKeyIconStatus();
    $('.network.' + networkName + ' .icon-key').click(login);
  };

  function updateKeyIconStatus() {
    if (isAuthenticated()) {
      $('.network.' + networkName + ' .icon-key').addClass('authenticated');
    } else {
      $('.network.' + networkName + ' .icon-key').addClass('pending-authentication');
    }
  }

  function login() {
    $.ajax({
      type: 'PUT',
      url: '/return_to',
      data: { location: window.location.hash.replace('#','') },
      complete: function () {
        window.location = '/auth/' + networkName;
      }
    });
  };

  return api;
};

var facebookNetwork = function () {
  var api = {};

  function login() {
    facebook.login(function () {
      $('.facebook-icon').removeClass('pending-authentication');
    });
  }

  api.initialize = function () {
    $('.network.facebook .icon-facebook').addClass('loading-status');
    $('.network.facebook .icon-key').addClass('loading-status');
    facebook.initialize(function () {
      $('.network.facebook .icon-facebook').removeClass('loading-status');
      $('.network.facebook .icon-key').removeClass('loading-status');
      if (facebook.isAuthenticated()) {
        $('.network.facebook .icon-key').addClass('authenticated');
      } else {
        $('.network.facebook .icon-key').addClass('pending-authentication');
        $('.facebook-icon').click(login);
      }
    });
  };

  return api;
}();
