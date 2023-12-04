const usersRouter = require('express').Router()
const userController = require('../controllers/user-controller')
const { isAuthenticated } = require('../utils/middleware')

/* RESET user PASSWORD */
usersRouter.post('/passwordreset', userController.passwordReset)

/* CONFIRM NEW user PASSWORD */
usersRouter.post('/passwordresetconfirm', userController.passwordResetConfirm)

/* POST user */
usersRouter.post('/register', userController.createUser)

/* LOGIN user */
usersRouter.post('/login', userController.login)

/* ACTIVATE user */
usersRouter.post('/:id/activate', userController.activate)

/* CHECK IF user VERIFIED */
usersRouter.get('/is-verified/:email', userController.isVerified)

/* PUT user */
usersRouter.put('/:id', isAuthenticated, userController.update)

/** SIGNOUT */
usersRouter.get('/signout', userController.signout);

/** DELETE */
usersRouter.delete('/:id', isAuthenticated, userController.delete)

/** SEND 2FA TOKEN */
usersRouter.post('/sendcode', userController.send2fa);

/** RESEND 2FA TOKEN */
usersRouter.post('/resendcode', userController.resend2fa);

/** VERIFY 2FA TOKEN */
usersRouter.post('/verifycode', userController.verify2fa);

/** DISABLE 2FA */
usersRouter.post('/disable2fa', isAuthenticated, userController.disable2fa);

/** DISABLE 2FA REQUEST */
usersRouter.post('/disable2farequest', isAuthenticated, userController.disable2faRequest);

/** CANCEL 2FA DISABLE REQUEST */
usersRouter.post('/canceldisable2fa', isAuthenticated, userController.cancelDisable2fa);

/** GET PHONE NUMBER */
usersRouter.get('/:id/phonenumber', userController.getNumber);

usersRouter.get('/googlefit', userController.syncGFit);

usersRouter.post('/getToken', userController.getToken);


module.exports = usersRouter
