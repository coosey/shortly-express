const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  req.session = {};
  if (req.cookies.shortlyid === undefined) {
    models.Sessions.create()
      .then((results) => {
        return models.Sessions.get({ id: results.insertId });
      })
      .then((results) => {
        req.session = results;
        //req.session.user = 'Tester';
        res.cookie('shortlyid', results.hash);
        next();
      });
  } else {
    models.Sessions.get({hash: req.cookies.shortlyid})
      .then( (results) => {
        req.session = results;

        res.cookie('shortlyid', results.hash);
        next();
      })
      .catch( () => {
        models.Sessions.create()
          .then((results) => {
            return models.Sessions.get({ id: results.insertId });
          })
          .then((results) => {
            req.session = results;
            res.cookie('shortlyid', results.hash);
            next();
          });
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/


