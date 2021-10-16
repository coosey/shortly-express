const parseCookies = (req, res, next) => {

  var cookies = {};
  var cookieArray = [];
  if (req.headers.cookie !== undefined) {
    cookieArray = req.headers.cookie.split('; ');
    for (let i = 0; i < cookieArray.length; i++) {
      var parsed = cookieArray[i].split('=');
      cookies[parsed[0]] = parsed[1];
    }
  }
  req.cookies = cookies;
  next();
};

module.exports = parseCookies;