const { User } = require("../models");
const Token = require("../models/Token");
const AccountStatus = require("../utils/AccountStatus");
const Response = require("../utils/Response");
const {signToken} = require("../utils/auth");
const bcrypt = require("bcrypt");
const emailService = require('../utils/email/emailService')
const emailTypes = require('../utils/email/emailTypes');
const TokenTypes = require("../utils/tokenTypes");
const crypto = require("crypto");
const { send, verify } = require("../utils/2fa/2faService");
const { google } = require("googleapis");
const url = require('url');
const { ObjectId } = require("mongodb");

const SALT = 10;

const oAuth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
);
 
async function activationToken(user) {

  const activationToken = crypto.randomBytes(32).toString("hex")

  const t = new Token({
      user: user._id,
      token: activationToken,
      createdAt: Date.now(),
      tokenType: TokenTypes.AccountActivation
  })

  await t.save()

  return activationToken;
}

module.exports = {
    async createUser(body) {

      let user;

      try{
        user = await User.create(body);
      }catch(err) {
        console.log("error creating user!", err);
        return new Response('Error', 500, "Error creating user!");        
      }

        if (!user) {
          return null;
        }

        const token = await activationToken(user);

        try {
          await emailService.send(user.email, emailTypes.WELCOME.subject, {
            name: user.name,
            link : `${process.env.FRONTEND_URL}/activate/${token}?id=${user._id}`
          }, emailTypes.WELCOME.template); 
        } catch (error) {
          console.log("error calling emailService!", error);
          await User.findByIdAndDelete(user._id);
          return new Response('Error', 500, "Error creating user!");
        }
  
        return new Response('Success', 201, 'User created!', user);
    },   

    async userExists(body) {
        const user = await User.findOne({
            $or: [{ email: body.email }],
          });
          if (!user) {
            return null;
          }
          return user;
    },

    async checkPassword(user, body) {

          const correctPw = await user.isCorrectPassword(body.password);
      
          if (!correctPw) {
            return false;
          }
          return true;
    },

    async activate(id, token) {
    // finds activation token
    const activationToken = await Token.findOne({ user: id, tokenType: TokenTypes.AccountActivation })
    if (!activationToken) return new Response("Error", 400, "No activation token", null);
    // verify token is valid
    if (!activationToken.compareTokens(token)) return  new Response("Error", 400, "Invalid Token", null);
    let user = null
      // activate account
    user = await User.findByIdAndUpdate(id, {
        accountStatus: AccountStatus.Registered,
    }, { new: true, runValidators: true })

    await activationToken.deleteOne()
    return new Response("Success", 200, "Account Activated!", {user});
    },

    async isVerified(email) {
      const user = await User.findOne({email: email});
      // check if user exists
      if(!user) return new Response("Error", 404, "User not found", null);
  
      const verified = await user.isVerified();

      return new Response("Success", 200, "Verification status found", {verified : verified});
    },

    async getNumber(id) {
      let user = await User.findById(id);
      if (!user) return new Response("Error", 404, "User not found.", null);
      if(!user.phoneNumber) return new Response("Success", 200, "User has no phone number", {phoneNumber : null});
      return new Response("Success", 200, "User phone number found", {phoneNumber : user.phoneNumber});
    },

    async passwordReset(email) {
      let user = await User.findOne({ email: email });
      if (!user) return new Response("Error", 404, "User not found.", null);

      // if already issued tokent then delete and issue new
      const token = await Token.findOne({ user: user._id, tokenType: TokenTypes.PasswordReset });
      if (token) await Token.findByIdAndDelete(token._id);

      // generate token
      const resetToken = crypto.randomBytes(32).toString("hex")

      const res = new Token({
        user: user._id,
        token: resetToken,
        createdAt: Date.now(),
        tokenType: TokenTypes.PasswordReset
      })

      await res.save()

      // set account to pending 
      const verified = await user.isVerified();

      if(verified) {
        user = await User.findByIdAndUpdate(user._id, {
          accountStatus: AccountStatus.Pending,
        }, { new: true, runValidators: true })
      }

      await emailService.send(email, emailTypes.CHANGE_PASSWORD_REQUEST.subject, {
          name: user.name,
          link: `${process.env.FRONTEND_URL}/resetpassword/${resetToken}?id=${user._id}&email=${user.email}`
      }, emailTypes.CHANGE_PASSWORD_REQUEST.template)

      return new Response("Success", 200, "Password reset request sent", {token : resetToken});
    },

    async passwordResetConfirm(id, token, password) {
      if (password.length < 8) return new Response("Error", 400, "Password is too small",  {reset : false});
      // finds token
      const resetToken = await Token.findOne({ user: id, tokenType: TokenTypes.PasswordReset })
      if (!resetToken) return new Response("Error", 404, "Reset Token not found.",  {reset : false});
  
      // compares token with the request token
      const valid = await resetToken.compareTokens(token);
      if (!valid) return new Response("Error", 400, "Invalid Reset Token.",  {reset : false});
  
      // hash new password
      const passwordHash = await bcrypt.hash(password, SALT)

      let u = await User.findById(id);

      if(!u) {
        return new Response("Error", 404, "User not found.",  {reset : false});
      }

      if(u.phoneNumber) {
        u = await User.findByIdAndUpdate(id, {
          password: passwordHash,
          accountStatus: AccountStatus.TwoFA
      }, { new: true, runValidators: true })
      }else {
        u = await User.findByIdAndUpdate(id, {
          password: passwordHash,
          accountStatus: AccountStatus.Registered
      }, { new: true, runValidators: true })
      }
  
      await Token.findByIdAndDelete(resetToken._id)
  
      await emailService.send(u.email, emailTypes.CHANGE_PASSWORD_CONFIRM.subject, {
          name: u.name,
      }, emailTypes.CHANGE_PASSWORD_CONFIRM.template)
  
      return new Response("Success", 200, "Password Reset!", {reset : true});
    },

    async update(id, body, user) {
      const u = await User.findById(id)
      let updates = {};
      if(body.name) {
        updates.name = body.name;
      }

      if(body.email) {
        updates.email = body.email;
        if(u.email === updates.email){
          return new Response("Error", 400, "User entered current email", null);
        }
      }
      if(body.newPassword) {

        const validPass = await u.isCorrectPassword(body.password);
        if(!validPass) return new Response("Error", 401, "Current password Invalid", null);
        const saltRounds = 10;
        updates.password = await bcrypt.hash(body.newPassword, saltRounds);
      }
        // verify permissions
      if(user._id.equals(id)) {
          const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true })

        if(updates.email) {
          await emailService.send(body.email, emailTypes.CHANGE_EMAIL.subject, {
            name: user.name,
          }, emailTypes.CHANGE_EMAIL.template);
        }
        if(updates.password) {
          await emailService.send(u.email, emailTypes.CHANGE_PASSWORD_CONFIRM.subject, {
            name: user.name,
          }, emailTypes.CHANGE_PASSWORD_CONFIRM.template)
        }
          return new Response("Success", 200, "User successfully updated", {user : updatedUser});
      } else {
        return new Response("Error", 401, "Unauthorized Request", null);
      }
    },

    async sendUserSigned(user) {
        const token = signToken(user);
        return {token, user};
    },

    async deleteUser(id, reqUser) {
      const u = await User.findById(id);
      const email = u.email
      const name = u.name
      // verify permissions
      if(reqUser._id.equals(id) )
          await User.findByIdAndDelete(id)
      else return new Response("Error", 401, "Insuffient permission", null);
  
      await emailService.send(email, emailTypes.ACCOUNT_DELETED.subject, {
          name: name
      }, emailTypes.ACCOUNT_DELETED.template)
  
      return new Response("Success", 204, "User successfully deleted", {user : u});
    },

    async send2FA(id, phoneNumber) {

      const u = await User.findById(id);
      if(phoneNumber) {

        const expiration = new Date().getTime() + 2*60000;

        const res = {
          user: u._id,
          phoneNumber : phoneNumber,
          deleteToken: expiration,
          createdAt: Date.now(),
          tokenType: TokenTypes.TwoFA,
          attempts : 0
        };
        await Token.findOneAndUpdate({phoneNumber : phoneNumber}, res, {upsert : true, new : true});

        let status;
        try{
          status = await send(phoneNumber);
        }catch(err) {
          return new Response("Error", err.status, err.message, err);
        }

        if(status === 'pending') {
          return new Response("Success", 200, "Code sent to device", null);
        }else {
          return new Response("Error", 500, "Error occured while sending code.", status);
        }

      }else {
        const res = await Token.findOne({user : u._id});
        if(!res) {
          return new Response("Error", 404, "Error request expired, resubmit phone number for SMS", {user : u});
        }
        const phoneNumber = res.phoneNumber;
        await Token.deleteOne({user : u._id});

        const expiration = new Date().getTime() + 2*60000;

        const newToken = new Token({
          user: u._id,
          phoneNumber : phoneNumber,
          deleteToken: expiration,
          createdAt: Date.now(),
          tokenType: TokenTypes.TwoFA
        });
        await newToken.save();        

        let status;
        try{
          status = await send(phoneNumber);
        }catch(err) {
          return new Response("Error", 500, "Error, internal server error", err);
        }

        if(status === 'pending') {
          return new Response("Success", 200, "Code sent to device", null);
        }else {
          return new Response("Error", 400, "Error while sending code", {user : u});
        }
      }
    },

    async verify2FA(phoneNumber, code) {
      const res = await Token.findOne({phoneNumber :phoneNumber});
      if(!res) {
        return new Response("Error", 404, "Error, User for associated phone number was not found.", null);
      }
      if((res.deleteToken.getTime() + 8*60000) < new Date().getTime()){
        await Token.deleteOne({phoneNumber : phoneNumber});
        return new Response("Error", 400, "Error, phone number submission expired, resubmit phone number", new Error("Token expired"));
      }

      if(res.deleteToken.getTime() <  new Date().getTime()) {
        return new Response("Error", 400, "Error, token expired, please resend", new Error("Token expired"));
      }

      if(res.attempts >= 10) {
        return new Response("Error", 429, "Error, token max attempts exceeded, please resend", new Error("Token expired"));
      }

      let status;
      try{
        status = await verify(phoneNumber, code);
      }catch(err) {
        return new Response("Error", 500, "Error, internal server error", err);
      }
      if( status === 'approved') {
        const user = await User.findById(res.user._id.toString());
        if(!user.phoneNumber) {
          user.phoneNumber = phoneNumber;
          user.accountStatus = AccountStatus.TwoFA;
          await user.save();
        }
        await Token.deleteOne({phoneNumber : phoneNumber});
        return new Response("Success", 200, "Code Approved.", {user : user});
      } else {
        res.attempts += 1;
        await res.save();
        return new Response("Error", 400, "Error, Code invalid.", null);
      }           
    },

    async disable2FARequest(id, password) {
      let user = await User.findById(id);
      if (!user) return new Response("Error", 404, "User not found.", null);

      const update = {
        $set : {accountStatus : AccountStatus.PendingTwoFA},
      }

      const updatedUser = await User.findByIdAndUpdate(id, update, {new : true, runValidators : true});    

      const validPass = await user.isCorrectPassword(password);
      if(!validPass) return new Response("Error", 401, "Current password Invalid", null);

      // if already issued token then delete and issue new
      const token = await Token.findOne({ user: user._id, tokenType: TokenTypes.DisableTwoFA });
      if (token) await Token.findByIdAndDelete(token._id);

      // generate token
      const resetToken = crypto.randomBytes(32).toString("hex")

      const res = new Token({
        user: user._id,
        token: resetToken,
        createdAt: Date.now(),
        tokenType: TokenTypes.DisableTwoFA
      })

      await res.save()

      // change to send code to email
      await emailService.send(user.email, emailTypes.DISABLE_2FA_REQUEST.subject, {
          name: user.name,
          code : `${resetToken}`
      }, emailTypes.DISABLE_2FA_REQUEST.template)

      return new Response("Success", 200, "Disable 2FA request sent", {user : updatedUser});
    },

    async disable2FA(id, code) {
      let u = await User.findById(id);
      const disableToken = await Token.findOne({ user: id, tokenType: TokenTypes.DisableTwoFA });
      if (!disableToken) return new Response("Error", 404, "Reset Token not found.",  {reset : false});
  
      // compares token with the request token
      const valid = await disableToken.compareTokens(code);
      if (!valid) return new Response("Error", 400, "Invalid Disable Code.",  {reset : false});
      const update = {
        $set : {accountStatus : AccountStatus.Registered},
        $unset : {phoneNumber : 1}
      }
      u = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      await Token.findByIdAndDelete(disableToken._id)
      await emailService.send(u.email, emailTypes.DISABLE_2FA_CONFIRM.subject, {
          name: u.name,
      }, emailTypes.DISABLE_2FA_CONFIRM.template)
  
      return new Response("Success", 200, "2FA Disabled!",{user : u});
    } ,

    async cancelDisable2FA(id) {
      let u = await User.findById(id);

      if (!u) return new Response("Error", 404, "User not found.", null);
      
      const disableToken = await Token.findOne({ user: id, tokenType: TokenTypes.DisableTwoFA });
      if( !disableToken && (u.accountStatus === AccountStatus.PendingTwoFA) && u.phoneNumber) {
        const update = {
          $set : {accountStatus : AccountStatus.TwoFA},
        }
  
        const updateUser = await User.findByIdAndUpdate(id, update, {new : true, runValidators : true});     
  
        return new Response("Success", 200, "Disable request cancelled!",{user : updateUser});
      }
      if (!disableToken) return new Response("Error", 404, "Reset Token not found.",  {reset : false});
      await Token.findByIdAndDelete(disableToken._id);

      const update = {
        $set : {accountStatus : AccountStatus.TwoFA},
      }

      const updateUser = await User.findByIdAndUpdate(id, update, {new : true, runValidators : true});     

      return new Response("Success", 200, "Disable request cancelled!",{user : updateUser});
    },

    async syncGFit() {

      const SCOPE = [
        'https://www.googleapis.com/auth/userinfo.profile', // get user info
        'https://www.googleapis.com/auth/userinfo.email',   // get user email ID and if its verified or not
        'https://www.googleapis.com/auth/fitness.activity.write',
        'https://www.googleapis.com/auth/fitness.blood_glucose.write',
        'https://www.googleapis.com/auth/fitness.blood_pressure.write',
        'https://www.googleapis.com/auth/fitness.body.write',
        'https://www.googleapis.com/auth/fitness.body_temperature.write',
        'https://www.googleapis.com/auth/fitness.heart_rate.write',
        'https://www.googleapis.com/auth/fitness.location.write',
        'https://www.googleapis.com/auth/fitness.nutrition.write',
        'https://www.googleapis.com/auth/fitness.oxygen_saturation.write',
        'https://www.googleapis.com/auth/fitness.reproductive_health.write',
        'https://www.googleapis.com/auth/fitness.sleep.write'
      ];

      const url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPE,
        prompt: 'consent'
      })
      return new Response("Success", 200, "Access url granted!",{url : url});
    },

    async activateCode(redirectUrl, id) {
      try {
        const { code } = url.parse(redirectUrl, true).query;
        const { tokens } = await oAuth2Client.getToken({code, redirect_uri : 'http://localhost:5173'});
        await User.updateOne({'_id' : id}, {syncActive : true, refreshToken: tokens.refresh_token, gfitToken: tokens.access_token});
        const newUser = await User.findById(id);
        return new Response("Success", 200, "Access granted!",{user : newUser});
      } catch (error) {
        console.log(error);
        return new Response("Error", 400, "Error access denied!",{error : error});
      }
    }
}