const mongoose = require('mongoose')
const TokenTypes = require('../utils/tokenTypes')
const bcrypt = require("bcrypt");

const tokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    phoneNumber : {
        type : String,
        unique : true,
        required: false,
        match: [/^\+[1-9]{1,3}[0-9]{3,14}$/]
    },
    token: {
        type: String,
        required: not2FA,
    },
    deleteToken : {
        type: Date,
        required : false
    },
    attempts : {
        type : Number,
        required : true,
        default : 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60*60*24*3,
    },
    tokenType: {
        type: Number,
        enum: Object.values(TokenTypes),
        required: true
    }
})

// hash user password
tokenSchema.pre("save", async function (next) {
    if(this.token) {
        const saltRounds = 10;
        this.token = await bcrypt.hash(this.token, saltRounds);  
    }
    next();
  });

tokenSchema.methods.compareTokens = async function (token) {
    const valid = await bcrypt.compare(token, this.token);
    return valid;
}

function not2FA() {
    return this.tokenType !== TokenTypes.TwoFA;
}

module.exports = mongoose.model('Token', tokenSchema)