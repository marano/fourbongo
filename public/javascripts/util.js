var cheatedUnescape = function (encodedStr) {
  var div = $("<div/>").html(encodedStr);
  if (div.text) {
    return div.text();
  } else {
    return encodedStr;
  }
}
