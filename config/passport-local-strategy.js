const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models").user;

passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: "User not found" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return done(null, false, { message: "Invalid password" });
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));