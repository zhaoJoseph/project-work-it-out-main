const config = require('./utils/config')
const {promisify} = require('util');
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const usersRouter = require('./routes/user-routes')
const sessionsRouter = require('./routes/session-routes');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    uri: config.MONGODB_URI,
    collection: 'mySessions'
  });

  store.on('error', function(error) {
    console.log(error);
  });

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message)
    })

app.use(cors({
    origin: "http://localhost:5173", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
}))

// app.use(express.static('build'))   to be added when prod build is ready
app.use(express.json())

app.use(require('express-session')({
    secret: 'This is a secret',
    cookie: {
        sameSite: true,
        secure: false,
        maxAge: 6000000,
        path: '/'
    },
    store: store,
    resave: false,
    saveUninitialized: true
  }));

  app.use((req, res, next) => {
    req.session.saveAsync = promisify(req.session.save.bind(req.session));
    next();
  });

app.use('/user', usersRouter);
app.use('/session', sessionsRouter);


module.exports = app