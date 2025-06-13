const Joi = require("joi");

const validate = (schema) => {
  return (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0)
      return res.status(400).json({ message: "No body provided" });
    const { error } = schema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    next();
  };
};

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(255).required(),
  role: Joi.string().valid("student", "instructor").required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().min(3).max(255).required(),
  password: Joi.string().min(6).max(255).required(),
});

const courseSchema = Joi.object({
  title: Joi.string().min(6).max(100).required(),
  category: Joi.string()
    .valid(
      "Web Development",
      "Mobile Development",
      "Data Science",
      "AI",
      "Game Development",
      "Cloud Computing",
      "Cybersecurity",
      "DevOps",
      "Blockchain",
      "UI/UX Design",
      "Digital Marketing",
      "Other"
    )
    .required(),
  price: Joi.number().min(1).max(9999).required(),
});

const userUpdateSchema = Joi.object({
  username: Joi.string().min(3).max(50),
  email: Joi.string().email().min(3).max(255),
  password: Joi.string().min(6).max(255),
})
  .min(1)
  .message("At least one field must be provided for update");

const passwordUpdateSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
  confirmNewPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  courseSchema,
  userUpdateSchema,
  passwordUpdateSchema,
  validate,
};
