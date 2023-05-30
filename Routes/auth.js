const express = require('express');
const User = require('../models/User');
const router = express.Router();
var jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../Middleware/fetchuser')
const bcrypt = require('bcrypt');
const JWT_SecretKey = "D3m0nK1nG"

//Route:1 Create a User using: POST "/api/auth/createuser". No login required localhost:5000/api/auth/createuser ThunderClient EndPoint
router.post('/createUser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  let success=false
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success,errors: errors.array() });
  }
  // Check whether the user with this email exists already
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      success=false
      return res.status(400).json({success,error: "Sorry a user with this email already exist" })
    }
    // Create a new user
    let salt = await bcrypt.genSalt(10)
    let SecPassword = await bcrypt.hash(req.body.password, salt)
    user = await User.create({
      name: req.body.name,
      password: SecPassword,
      email: req.body.email,
    })
    let data = {
      user: user.id
    }
    let authToken = jwt.sign(data, JWT_SecretKey)
    success=true
    res.json({ success,"AuthToken": authToken })

  } catch (error) {
    success=false
    console.error(error.message);
    res.status(500).send("Internal Error Occured");
  }
})

//Route:2 Authentication for Login using Credantials no user Required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 5 characters').exists()
], async (req, res) => {
  let success=false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SecretKey);
    success = true;
    res.json({ success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route : Get Logged User data No Login Required
router.post('/getUser', fetchuser, async (req, res) => {
  try {
    // find the user Id
    let userId = req.user
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Error Occured");
  }
})
module.exports = router