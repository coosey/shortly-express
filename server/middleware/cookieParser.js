const parseCookies = (req, res, next) => {

  var cookies = {
    //shortlyid: '18ea4fb6ab3178092ce936c591ddbb90c99c9f66',
    //otherCookie: '2a990382005bcc8b968f2b18f8f7ea490e990e78',
    //anotherCookie: '8a864482005bcc8b968f2b18f8f7ea490e577b20'
  };
  var cookieArray = [];
  if (req.headers.cookie !== undefined) {
    cookieArray = req.headers.cookie.split('; ');
  }
  //Iterate through cookieArray, split each element by '='
  //Set first element to key, second element to value in cookies object
  for (let i = 0; i < cookieArray.length; i++) {
    var parsed = cookieArray[i].split('=');
    cookies[parsed[0]] = parsed[1];
  }
  //console.log('our console: ', cookieArray);
  //console.log('object: ', cookies);
  req.cookies = cookies;
  next();
};

module.exports = parseCookies;