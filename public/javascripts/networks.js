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

var SocialNetwork = function (networkName, credentialPool) {
  var api = {};

  api.showError = function () {
    warningIconElement().show();
  };

  function authenticatedCookieName() {
    return networkName + '_authenticated';
  }

  function randomCredentialFromPool() {
    return credentialPool[Math.floor(Math.random() * credentialPool.length)];;
  }

  api.accessTokenParameter = function () {
    if (isAuthenticated()) {
      return 'access_token=' + $.cookie(networkName + '_access_token');
    } else {
      return 'client_id=' + randomCredentialFromPool();
    }
  }

  function isAuthenticated() {
    return $.cookie(authenticatedCookieName()) == 'true';
  }

  function iconElement() {
    return $('.network.' + networkName + ' .icon-' + networkName);
  }

  function keyIconElement() {
    return $('.network.' + networkName + ' .icon-key');
  }

  function warningIconElement() {
    return $('.network.' + networkName + ' .icon-warning-sign');
  }

  api.initialize = function () {
    iconElement().attr('title', networkName.capitalize());
    warningIconElement().attr('title', 'There was an issue with this service. Authenticating might solve the problem.');
    updateKeyIconStatus();
    keyIconElement().click(login);
  };

  function updateKeyIconStatus() {
    if (isAuthenticated()) {
      keyIconElement().attr('title', 'Authenticated');
      keyIconElement().addClass('authenticated');
    } else {
      keyIconElement().attr('title', 'Pending Authentication. Click to authenticate.');
      keyIconElement().addClass('pending-authentication');
    }
  }

  function login() {
    if (isAuthenticated()) {
      return;
    }
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
  var api = {
    isAuthenticated: false
  };

  function login() {
    if (api.isAuthenticated) {
      return;
    }

    facebook.login(function () {
      $('.network.facebook input').removeAttr('title');
      $('.network.facebook input').removeAttr('disabled');
      $('.network.facebook .icon-key').addClass('authenticated');
      $('.network.facebook .icon-key').attr('title', 'Authenticated');
      $('.facebook-icon').removeClass('pending-authentication');
    });
  }

  api.initialize = function () {
    $('.network.facebook .icon-facebook').attr('title', 'Loading Facebook ...');
    $('.network.facebook .icon-facebook').addClass('loading-status');
    $('.network.facebook .icon-key').addClass('loading-status');
    $('.network.facebook input').attr('disabled', 'disabled');

    facebook.initialize(function (isAuthenticated) {
      api.isAuthenticated = isAuthenticated;

      $('.network.facebook .icon-facebook').attr('title', 'Facebook');
      $('.network.facebook .icon-facebook').removeClass('loading-status');
      $('.network.facebook .icon-key').removeClass('loading-status');

      if (isAuthenticated) {
        $('.network.facebook input').removeAttr('disabled');
        $('.network.facebook .icon-key').addClass('authenticated');
        $('.network.facebook .icon-key').attr('title', 'Authenticated');
      } else {
        $('.network.facebook input').attr('title', 'Please authenticate in order to use this service.');
        $('.network.facebook .icon-key').attr('title', 'Pending Authentication. Click to authenticate.');
        $('.network.facebook .icon-key').addClass('pending-authentication');
        $('.network.facebook .icon-key').click(login);
      }
    });
  };

  return api;
}();
