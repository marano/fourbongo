var facebook = function () {
 var api = {};

  api.initialize = function (callback) {
    $('body').append($('<div>', {id: 'fb-root'}));
    var app_id = $('meta[name=facebook_app_id]').attr('content');

    window.fbAsyncInit = function() {
      FB.init({
        appId      : app_id,
        channelURL : '//fourbongo.com/channel.html', // Channel File
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        oauth      : true, // enable OAuth 2.0
        xfbml      : true  // parse XFBML
      });

      FB.getLoginStatus(function(response) {
        var authenticated = !!response.authResponse;
        callback(authenticated);
      });
    };
 
    var js, id = 'facebook-jssdk';
    if (document.getElementById(id)) {return;}
    js = document.createElement('script');
    js.id = id;
    js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    document.getElementsByTagName('head')[0].appendChild(js);
  };

  api.login = function (callback) {
    FB.login(function (response) {
      if (response.authResponse) {
        callback();
      }
    });
  };

  api.updates = function (userId, callback) {
    FB.api(userId + '/feed', function (data) {
      var updates = _(data.data).map(function (update) {
        return FacebookUpdate({id: update.id, userId: userId, username: update.from.name, content: cheatedUnescape(update.message), createdAt: new Date(update.created_time), isFacebookUpdate: true});
      });
      callback(updates);
    });
  };

  api.updatesByTags = function (tags, callback) {
    _(tags).each(function (eachTag) {
      FB.api('search?q=' + eachTag + '&type=post&limit=200', function (data) {
        var updates = _(data.data).map(function (update) {
          return FacebookUpdate({id: update.id, userId: update.from.id, username: update.from.name, content: cheatedUnescape(update.message), createdAt: new Date(update.created_time), isFacebookUpdate: true});
        });
        callback(updates);
      });
    });
  };

  return api;
}();

