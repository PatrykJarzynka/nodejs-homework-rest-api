const User = require("../service/schemas/User");
const jwt = require("jsonwebtoken");
var gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");

const signUser = async ({ res, value }) => {
  const existingUser = await User.findOne({
    email: value.email,
  });

  if (existingUser) {
    return res.status(409).json({ message: "Email in use" });
  }
  const newUser = new User({
    email: value.email,
    subscription: value.subscription,
    avatarURL: gravatar.url(value.email),
    verify: value.verify,
    verificationToken: uuidv4(),
  });

  await newUser.setPassword(value.password);
  await newUser.save();
  await newUser.sendMail(value.email, newUser.verificationToken);

  return newUser;
};

const loginUser = async ({ value, res }) => {
  const user = await User.findOne({ email: value.email });
  const isPasswordCorrect = await user.validatePassword(value.password);
  if (!user || !isPasswordCorrect) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

  if (!user.verify)
    return res.status(401).json({ message: "Email not verified" });

  const payload = {
    id: user._id,
    email: user.email,
    subscription: user.subscription,
    avatarURL: user.avatarURL,
    verify: user.verify,
    verificationToken: user.verificationToken,
  };

  const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "12h" });

  const updatedUser = {
    id: user._id,
    email: user.email,
    subscription: user.subscription,
    avatarURL: user.avatarURL,
    token: token,
    verify: user.verify,
    verificationToken: user.verificationToken,
  };

  await User.findOneAndUpdate(
    {
      email: value.email,
    },
    { $set: updatedUser },
    {
      new: true,
      runValidators: true,
      strict: "throw",
    }
  );

  return {
    user: {
      email: user.email,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
      token: token,
      verify: user.verify,
      verificationToken: user.verificationToken,
    },
  };
};

const verifyUser = async ({ verificationToken }) => {
  await User.findOneAndUpdate(
    {
      verificationToken: verificationToken,
    },
    { $set: { verify: true, verificationToken: null } },
    {
      new: true,
      runValidators: true,
      strict: "throw",
    }
  );
};

const resendEmailToUser = async ({ value }) => {
  const user = await User.findOne({ email: value.email });
  if (user.verify) throw new Error();
  await user.sendMail(user.email, user.verificationToken);
};

module.exports = {
  signUser,
  loginUser,
  verifyUser,
  resendEmailToUser,
};
