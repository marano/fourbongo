var flickr = function () {
  var api = {};
  var pvt = {
    apiKey: '5604fa17de2386df1d04bc9977132769'
  };

  api.picsByLocation = function (latitude, longitude, callback) {
    $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&api_key=' + pvt.apiKey + '&sort=date-posted-desc&content_type=1&media=photos&radius=10&per_page=500&lat=' + latitude + '&lon=' + longitude + '&extras=description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_m, url_z, url_l, url_o&jsoncallback=?', function (data) {
      var pics = _(data.photos.photo).map(function (pic) {
        return FlickrPic({id: pic.id, username: pic.ownername, media: pic.url_z, caption: pic.description._content, createdAt: new Date(parseInt(pic.dateupload) * 1000), avatar: pvt.avatar(pic.iconfarm, pic.iconserver, pic.owner), isUpdateByLocation: true, latitude: pic.latitude, longitude: pic.longitude})
      });
      callback(pics);
    });
  };

  pvt.avatar = function (iconFarm, iconServer, nsid) {
    return 'http://farm' + iconFarm + '.static.flickr.com/' + iconServer + '/buddyicons/' + nsid + '.jpg';
  };

  return api;
}();
