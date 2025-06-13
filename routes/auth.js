const express = require("express");
const router = express.Router();
const User = require("../models").user;
const {
  registerSchema,
  loginSchema,
  userUpdateSchema,
  passwordUpdateSchema,
} = require("./validation");
const validate = require("./validation").validate;
const passport = require("passport");
require("../config/passport-local-strategy");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Course = require("../models").course;
const { formatCourses } = require("../utils/course-formatter");

router.use((req, res, next) => {
  console.log("Auth route");
  next();
});

router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", ["username", "email"])
      .exec();
    res.status(200).json({
      message: "Courses fetched successfully",
      courses: formatCourses(courses),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/test", async (req, res) => {
  const user = await User.find({});
  res.status(200).json({ message: "User fetched successfully", user });
});

router.post("/register", validate(registerSchema), async (req, res) => {
  const { username, email, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) {
    if (existingUser.email === email) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }
    if (existingUser.username === username) {
      return res
        .status(409)
        .json({ message: "This username is already taken." });
    }
  }
  try {
    const user = await User.create({ username, email, password, role });
    res.status(201).json({
      message: "User created successfully",
      user: {
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", validate(loginSchema), (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: "Auth failed", info });

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.PASSPORT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({
      message: "Logged in successfully",
      token: "Bearer " + token,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  })(req, res, next);
});

router.get("/logout", async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

// router.patch("/users/:id", validate(userUpdateSchema), async (req, res) => {
//   // Authorization Check: Ensure the user is updating their own profile
//   if (req.user._id.toString() !== req.params.id) {
//     return res.status(403).json({
//       message: "You are not authorized to update this user's profile.",
//     });
//   }

//   const { username, email, password } = req.body;
//   const updateData = {};

//   if (username) updateData.username = username;
//   if (email) updateData.email = email;

//   try {
//     // If password is being updated, it needs to be hashed
//     if (password) {
//       updateData.password = await bcrypt.hash(password, 12);
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     ).select("-password"); // Exclude password from the returned document

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     res.status(200).json({
//       message: "User profile updated successfully.",
//       user: updatedUser,
//     });
//   } catch (error) {
//     // Handle potential duplicate email/username errors
//     if (error.code === 11000) {
//       return res
//         .status(400)
//         .json({ message: "Email or username already exists." });
//     }
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

router.post(
  "/update-password",
  passport.authenticate("jwt", { session: false }),
  validate(passwordUpdateSchema),
  async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid current password." });
      }

      user.password = newPassword;
      await user.save();
      res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

module.exports = router;
