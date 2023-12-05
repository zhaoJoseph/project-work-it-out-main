const sessionsRouter = require('express').Router()
const sessionController = require('../controllers/session-controller');
const { isAuthenticated } = require('../utils/middleware');

/**CREATE SESSION */
sessionsRouter.post('/',  sessionController.createSession);

sessionsRouter.get('/:id/period',  sessionController.getSessionsPeriod);

module.exports = sessionsRouter