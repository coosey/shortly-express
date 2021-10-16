const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('*****', req.cookies.shortlyid);
  if (req.cookies.shortlyid === undefined) {
    //create a session
    //Ogenerate new hash then store in sessions db
    models.Sessions.create()
      .then((results) => {
        return models.Sessions.get({ id: results.insertId });
      })
      .then((results) => {
        // console.log(results);
        // console.log('results.hash: ', results.hash);
        req.session = results;

        res.cookie('shortlyid', results.hash);
        console.log('res.cookies: ', res.cookies);
        next();
      });
  } else {
    // models.Sessions.get
    req.session = req.session.id;
    console.log('does it get here ***', req.session.shortlyid);
    next();
  }
  //console.log('does it get here ***', req.session.shortlyid);
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/


