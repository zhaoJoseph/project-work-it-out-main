const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const AccountStatus = require("../utils/AccountStatus");

const UserSchema = new Schema({
  name : {
    type : String,
    required : "Name required",
    minlength: 2,
    trim: true
  },
  password: {
    type: String,
    trim: true,
    required: "Password is Required",
    minlength: 6,
  },
  email: {
    type: String,
    unique: true,
    required: "Email is Required",
    match: [/.+@.+\..+/],
  },
  phoneNumber : {
    type : String,
    unqiue : true,
    required: false,
    match: [/^\+[1-9]{1,3}[0-9]{3,14}$/]
  },
  accountStatus: {
    type: Number,
    enum: Object.values(AccountStatus),
    default: AccountStatus.Pending
  },
  gfitToken: {
    type: String,
    required: false,
    select : false
  },
  refreshToken : {
    type: String,
    required : false,
    select : false
  },
  syncActive : {
    type: Boolean,
    required: false,
    default : false
  }
});

// hash user password
UserSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// custom method to compare and validate password for logging in
UserSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.isVerified = async function () {
  return this.accountStatus >= AccountStatus.Registered;
}

const User = model("User", UserSchema);

module.exports = User;
