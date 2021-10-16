const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
// mounted middleware
const Auth = require('./middleware/auth');
const cookieParser = require('./middleware/cookieParser');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
// apply cookieParser
app.use(cookieParser);
app.use(Auth.createSession);
// added verifySession
var verifySession = function (req, res, next) {
  if (!models.Sessions.isLoggedIn(req.session)) {
    res.redirect('/login');
  } else {
    next();
  }
};

app.get('/', (req, res) => {
  verifySession(req, res, () => res.render('index'));
});

app.get('/create', (req, res) => {
  verifySession(req, res, () => res.render('index'));
});

app.get('/links',
  (req, res, next) => {
    verifySession(req, res, () => {
      models.Links.getAll()
        .then(links => {
          res.status(200).send(links);
        })
        .error(error => {
          res.status(500).send(error);
        });
    });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/signup', (req, res, next) => {
  //var params = [req.body.username, req.body.password];
  var username = req.body.username;
  var password = req.body.password;
  return models.Users.create({username, password})
    .then(result => {
      models.Sessions.update({hash: req.session.hash}, {userId: result.insertId});
      res.redirect('/');
    })
    .catch(result => {
      res.redirect('/signup');
    });
});

app.post('/login', (req, res, next) => {
  var attemptedPassword = req.body.password;
  //var realPassWord = models.Users.get({});
  var username = req.body.username;
  models.Users.get({username})
    .then(userInfo => {
      if (models.Users.compare(attemptedPassword, userInfo.password, userInfo.salt)) {
        models.Sessions.update({hash: req.session.hash}, {userId: userInfo.id})
          .then((results) => {
            req.session.user = {username: username};
            req.session.userId = userInfo.id;
            res.redirect('/');
          });
      } else {
        //Unsuccessful login
        res.redirect('/login');
      }
      //console.log(results);
    }).catch(results => {
      res.redirect('/login');
    });
});

app.get('/login', (req, res, next) => {
  res.render('login');
});

app.get('/logout', (req, res, next) => {
  // destroy session, cookie
  //When we want to destroy a session, we want to remove the session from the Sessions table
  //console.log('req.session', req.session);
  models.Sessions.delete({hash: req.session.hash})
    .then((results) => {
      next();
    });
});


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
