const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const { setUser } = require("../service/auth");

async function handleUserSignup(req, res) {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error: "Email already registered",
      });
    }

    // Create new user (password will be hashed automatically by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
    });
    
    return res.redirect("/login");
  } catch (error) {
    return res.render("signup", {
      error: "Error creating account. Please try again.",
    });
  }
}

async function handleUserLogin(req, res) {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", {
        error: "Invalid Email or Password",
      });
    }

    // Compare passwords using the schema method
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.render("login", {
        error: "Invalid Email or Password",
      });
    }

    const sessionId = uuidv4();
    setUser(sessionId, user);
    res.cookie("uid", sessionId);
    return res.redirect("/");
  } catch (error) {
    return res.render("login", {
      error: "Login error. Please try again.",
    });
  }
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
};