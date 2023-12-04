const { checkPassword, sendUserSigned, createUser, userExists, activate, isVerified, passwordReset, passwordResetConfirm, update, deleteUser, send2FA, verify2FA, disable2FARequest, disable2FA, getNumber, cancelDisable2FA, activateCode, syncGFit } = require("../services/user-service");
const {serialize} = require('cookie');
const { verify } = require("../utils/2fa/2faService");
module.exports = {

  // create a user, sign a token, and send it back to sign up page
  async createUser({ body }, res) {

    const exists = await userExists(body);

    if(exists) {
      return res.status(400).json({message : "User with email already exists!"});
    }

    let user;

    user = await createUser(body);

    if(user.type === 'Error') {
      return res.status(user.statusCode).json({message : user.message});
    }

    user = user.data;

    if (!user) {
      return res.status(400).json({ message: "Something is wrong!" });
    }

    res.json({user});
  },

  // login a user, sign a token, and send it back to login page
  async login(req, res) {

    const user = await userExists(req.body);

    if (!user) {
      return res.status(400).json({ message: "Can't find this user" });
    }

    const correctPw = await checkPassword(user, req.body);
    if (!correctPw) {
      return res.status(400).json({ message: "Wrong password!" });
    }
   
    const sendBody = await sendUserSigned(user);

    const verified = await user.isVerified();

    if(verified) {
      res.setHeader(
        "Set-Cookie",
        serialize("email", user.email, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "none"
        }),
      );
      req.session.user = user;
      await req.session.saveAsync();
    }
      return res.json(sendBody);
  },

  async activate({ params, body }, res) {
    const result = await activate(params.id, body.token)
    if(result.type === "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json(result.data);
  },

  async isVerified({params}, res) {
    const result = await isVerified(params.email)
    if(result.type === "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json(result.data);
  },


  async getNumber({params}, res) {
    const result = await getNumber(params.id)
    if(result.type === "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json(result.data);
  },

  async passwordReset({body}, res) {
        const result = await passwordReset(body.email)
        if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
        res.status(200).json({message : 'Reset token sent.'});
  },

  async passwordResetConfirm({body}, res) {
    const result = await passwordResetConfirm(body.id, body.token, body.password)
    if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json({message: 'Successful password change'})
  },

  async update({params, body, session}, res){
        const result = await update(params.id, body, session.user)
        if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
        res.status(200).json(result.data);
      },

  async signout(req, res) {
      res.setHeader(
        "Set-Cookie",
        serialize("email", "", {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
        }),
      );
      req.session.destroy(function(err) {
        if(err){
          console.log(err);
        }
        res.status(200).json({message : "Signed out Successful."});
      });
  },

  async send2fa({body}, res) {
    const result = await send2FA(body.id, body.phonenumber);
    if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json(result.data);
  },

  async resend2fa({body}, res) {
    const result = await send2FA(body.id);
    if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json(result.data);
  },

  async verify2fa({body}, res) {
    const result = await verify2FA(body.phonenumber, body.code);
    if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json(result.data);
  },

  async disable2fa({body}, res) {
    const result = await disable2FA(body.id, body.code);
    if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json(result.data);
  },

  async disable2faRequest({body}, res) {
    const result = await disable2FARequest(body.id, body.password);
    if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json(result.data);
  },

  async cancelDisable2fa({body}, res) {
    const result = await cancelDisable2FA(body.id);
    if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json(result.data);
  },

  async delete(req, res) {
    const result = await deleteUser(req.params.id, req.session.user);
    if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
    req.session.destroy(function(err) {
      if(err){
        console.log(err);
      }
      res.status(204).json({Message : "User deleted"});
    });
  },

  async syncGFit(req, res) {
    const result = await syncGFit();
    if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json(result.data);
  },

  async getToken({body}, res) {
    const result = await activateCode(body.url, body.id);
    if(result.type ===  "Error") return res.status(result.statusCode).json({ message : result.message});
    res.status(200).json(result.data);
  }

};
