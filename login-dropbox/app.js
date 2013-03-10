var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , DropboxStrategy = require('passport-dropbox').Strategy;

// À changer lorsque ce sera codeboot.org
var HOME_PAGE = "http://localhost/";
var fs = require('fs');
// var dropbox = require("dropbox");
var DropboxClient = require('dropbox-node').DropboxClient;
// var DROPBOX_APP_KEY = "--insert-dropbox-app-key-here--"
// var DROPBOX_APP_SECRET = "--insert-dropbox-app-secret-here--";

var DROPBOX_APP_KEY = "zhtm2yg0iqurunh"
var DROPBOX_APP_SECRET = "z1b5mb7p4a778wz";

var dropbox;

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing. However, since this example does not
// have a database of user records, the complete Dropbox profile is
// serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// //test
// var saveSession = function() {
//     localStorage["testpmr"] = JSON.stringify("testlol");
// };

// var loadSession = function() {
//     var state = localStorage["testpmr"];
//     console.log(state);
//     console.log(JSON.parse(state));
// }

// test
// var saveSession = function () {
//     var state = passport.serializeUser();
//     // localStorage["testpmr"] = JSON.stringify(state);
//     console.log("dans savesession");
//     // var state = cb.serializeState();
//     // localStorage["testpmr"] = JSON.stringify(state);
// };

// var loadSession = function () {
//     // Restore tabs
//     var state = localStorage["codeboot"];
    
//     if (!state) {
//         // For the transition period
//         state = localStorage["codeplay"];
//         localStorage.removeItem("codeplay");
//     }
//     if (state) {
//         cb.restoreState(JSON.parse(state));
//     }
// };

// Use the DropboxStrategy within Passport.
// Strategies in passport require a `verify` function, which accept
// credentials (in this case, a token, tokenSecret, and Dropbox profile), and
// invoke a callback with a user object.
passport.use(new DropboxStrategy({
    consumerKey: DROPBOX_APP_KEY,
    consumerSecret: DROPBOX_APP_SECRET,
    // callbackURL: "http://127.0.0.1:3000/auth/dropbox/callback"
    callbackURL: "http://localhost:3000/auth/dropbox/callback"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Dropbox profile is returned to
      // represent the logged-in user. In a typical application, you would want
      // to associate the Dropbox account with a user record in your database,
      // and return that user instead.
	// console.log(profile);
	dropbox = new DropboxClient(DROPBOX_APP_KEY, DROPBOX_APP_SECRET, token, tokenSecret);
	dropbox.root = 'sandbox';
	dropbox.putFile('test.txt', '/test.txt', function (err, data) {
	    if (err) return console.log(err);
	});
      return done(null, profile);
    });
  }
));




// var app = express.createServer();
var app = express();

// configure Express
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport! Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/dropbox
// Use passport.authenticate() as route middleware to authenticate the
// request. The first step in Dropbox authentication will involve redirecting
// the user to dropbox.com. After authorization, Dropbox will redirect the user
// back to this application at /auth/dropbox/callback
app.get('/auth/dropbox',
  passport.authenticate('dropbox'),
  function(req, res){
    // The request will be redirected to Dropbox for authentication, so this
    // function will not be called.
  });

// GET /auth/dropbox/callback
// Use passport.authenticate() as route middleware to authenticate the
// request. If authentication fails, the user will be redirected back to the
// login page. Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
app.get('/auth/dropbox/callback',
  passport.authenticate('dropbox', { failureRedirect: '/login' }),
  function(req, res) {
      // console.log(req.user);
      res.redirect(HOME_PAGE);
      // res.redirect('/test');
      // res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});




app.get('/test', ensureAuthenticated, function(req, res){
    res.render('test', { user: req.user });
    // dropbox.putFile('test2.txt', '/test2.txt', function (err, data) {
    // 	if (err) return console.log(err);
    // });
    console.log('tested');
});
    
app.get('/test/send', ensureAuthenticated, function(req, res){
    dropbox.putFile('test2.txt', '/test2.txt', function (err, data){
	if (err) return console.log(err);
    });
    // Pour codeboot, il faut refaire les redirections
    res.redirect(HOME_PAGE);
    console.log('test2');
});

app.get('/test/get', ensureAuthenticated, function(req, res){
    console.log('GET /');
    // if( req.isAuthenticated())
    // 	console.log('AUTHENTICATED');
    // else
    // 	console.log('NOT AUTHENTICATED');
	// res.redirect('/login');
    
    dropbox.getFile('/testfact.js', function(err, data){
	if (err) return console.log(err);
	// res.data = data;
	console.log(data);

	res.body = data;
	res.send(data);
	res.writeHead(200, {'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin':'*'});
	res.status(200);
	// res.writeHead(200, {'Content-Type': 'text/html'});
	// res.status(200);
	res.end(data);
	
    });
    // console.log('get finished');
    // res.send(file);
    // console.log(file);
    // res.writeHead(200, {'Content-Type': 'text/html'});
    // res.status(200);
    
    // res.end();
});

// app.get('/test/get', ensureAuthenticated, function(req, res){
    // console.log('dans get');
    
    // console.log('GET');
    
    
    // dropbox.getFile('/testfact.js', function(err, data){
    // 	if (err) return console.log(err);
    // 	console.log(data);
    // 	res.body = data;
    // 	console.log('get finished');
	
    // 	res.send(data);
    // 	console.log(res);
    // 	res.writeHead(200, {'Content-Type': 'text/html'});
    // 	res.status(200);
    // 	res.end();
    // });


    // console.log('get finished');
    // res.writeHead(200, {'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin':'*'});
    // req.addListener('end', function() {
    // 	console.log('end trigered');
    // 	res.write("post data");
    // 	res.end();
    // });
    
    	// console.log(res);

    // res.status(200);
    // res.send(200);
    // res.end();
    // res.send(data);


    // res.body = file;
    // console.log('get finished');
    // console.log(file);
    // res.send(file);
    // console.log(res);
// });
    

// app.get('/test', function(req, res){
//     ensureAuthenticated(req, res, function(req, res){
// 	console.log("test");
// 	res.redirect('/');
//     });
// });



    // ensureAuthenticated(),
	// passport.authenticate('dropbox', { failureRedirect: '/login'}),
	// function(req, res){
	//     console.log("test");
	//     console.log(passport);
	//     res.redirect('/');
	// });

// ** ajout PL **//
// app.get('/connect/', 
//     passport.authenticate('dropbox', {failureRedirect: '/login'}),
//     function(req, res){
// 	client = new dropbox
// 	// res.redirect('/https://api-content.dropbox.com/1/files/dropbox/Applications/TestMrPmR/test.txt');
//     });

// app.get('/test', function(req, res){
    


// app.listen(3000);
app.listen(3000, "localhost");
console.log('listening on 3000');


// Simple route middleware to ensure user is authenticated.
// Use this route middleware on any resource that needs to be protected. If
// the request is authenticated (typically via a persistent login session),
// the request will proceed. Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}