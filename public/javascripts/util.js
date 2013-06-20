var cheatedUnescape = function (encodedStr) {
  var div = $("<div/>").html(encodedStr);
  if (div.text) {
    return div.text();
  } else {
    return encodedStr;
  }
}

String.prototype.capitalize = function() {
  return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}
