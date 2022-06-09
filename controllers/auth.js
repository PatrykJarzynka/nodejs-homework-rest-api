const authService = require("../service/auth");
const Joi = require("joi");

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const resendEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const signup = async (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) res.status(400).json({ message: error.message });
  try {
    const result = await authService.signUser({ value, res });
    res.status(201).json({ user: result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) res.status(400).json({ message: error.message });
  try {
    const result = await authService.loginUser({ value, res });
    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  const { verificationToken } = req.params;
  try {
    await authService.verifyUser({ verificationToken });
    res.status(200).json({ message: "Verification successful" });
  } catch {
    res.status(404).json({ message: "User not found" });
  }
};

const resendEmail = async (req, res, next) => {
  const { error, value } = resendEmailSchema.validate(req.body);
  if (error) res.status(400).json({ message: error.message });
  try {
    await authService.resendEmailToUser({ value });
    res.status(200).json({ message: "Verification email sent" });
  } catch {
    res.status(400).json({ message: "Verification has already been passed" });
  }
};

module.exports = {
  signup,
  login,
  verifyEmail,
  resendEmail,
};
