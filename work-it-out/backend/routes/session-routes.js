const sessionsRouter = require('express').Router()
const sessionController = require('../controllers/session-controller');
const { isAuthenticated } = require('../utils/middleware');

/**CREATE SESSION */
sessionsRouter.post('/', isAuthenticated, sessionController.createSession);

sessionsRouter.get('/:id/period', isAuthenticated, sessionController.getSessionsPeriod);

module.exports = sessionsRouter