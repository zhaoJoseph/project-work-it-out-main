const WELCOME = {
    template: 'welcome',
    subject: 'Welcome to work-it-out!'
}

const ACCOUNT_DELETED = {
    template: 'account-deleted',
    subject: 'Your account has been deleted'
}

const CHANGE_EMAIL = {
    template: 'change-email',
    subject: 'Your email has been changed'
}

const DISABLE_2FA_REQUEST = {
    template : 'account-reset2fa',
    subject : 'Disable 2FA Request'
}

const DISABLE_2FA_CONFIRM = {
    template : 'account-reset2fa-complete',
    subject : '2FA has been disabled'
}


const CHANGE_PASSWORD_CONFIRM = {
    template: 'change-password',
    subject: 'Your password has been changed'
}

const CHANGE_PASSWORD_REQUEST = {
    template: 'forgot-password',
    subject: 'Forgot your password?'
}
module.exports = {
    WELCOME,
    ACCOUNT_DELETED,
    CHANGE_EMAIL,
    CHANGE_PASSWORD_CONFIRM,
    CHANGE_PASSWORD_REQUEST,
    DISABLE_2FA_REQUEST,
    DISABLE_2FA_CONFIRM
}
