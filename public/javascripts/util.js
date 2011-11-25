var cheatedUnescape = function (encodedStr) {
  var div = $("<div/>").html(encodedStr);
  if (div.text) {
    return div.text();
  } else {
    return encodedStr;
  }
}

Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}
