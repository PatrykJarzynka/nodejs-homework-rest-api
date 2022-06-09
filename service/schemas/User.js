const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const user = new Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: String,
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
});

user.methods.setPassword = async function (password) {
  this.password = await bcrypt.hash(password, bcrypt.genSaltSync(6));
};

user.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

user.methods.sendMail = async function (email, token) {
  const emailConfig = {
    to: email,
    from: email,
    subject: "Welcome to Patryk's REST API!",
    text: `Click link to verify your email`,
    html: `<p>Click link to verify your email: <p><strong><a href="http://localhost:${process.env.PORT}/users/verify/${token}">Verify</a><strong>`,
  };

  sgMail
    .send(emailConfig)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};

const User = mongoose.model("users", user);

module.exports = User;
