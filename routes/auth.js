// User routes
require("dotenv").config()
const express = require("express")
const {utils} = require("../Utils")
const router = express.Router()
const User = require("./../models/User")
const jwt = require('jsonwebtoken');

// POST /auth/signin ------------------
router.post('/signin', (req, res) => {
   // 1. validate request
   console.log("Sign-in attempt:", req.body);
   if( !req.body.email || !req.body.password){
      return res.status(400).json({
         message: "Please provide email and password"
      })
   }
   // 2. find user in database
   User.findOne({email: req.body.email})
      .then(user => {
         // if user doesn't exist
         if(user == null){
            return res.status(400).json({
               message: "Account doesn't exist"
            })
         }
         // 3. user exist (must exist)
         if(utils.verifyPassword(req.body.password, user.password) ){
            // 4. password verify
            const userObject = {
               _id: user._id,
               firstName: user.firstName,
               lastName: user.lastName,
               email: user.email
            }
            // 5. generate accessToken
            const accessToken = utils.generateAccessToken(userObject)
            // 6. send back respose with accessToken and user object
            res.json({
               accessToken: accessToken,
               user: userObject
            })            
         }else{
            // password doesn't match
            // send back error
            return res.status(400).json({
               message: "Password/Email incorrect"
            })
         }
      })
      .catch(err => {
         console.log(err)
         res.status(500).json({
            message: "problem signing in",
            error: err
         })
      })
})

// GET /auth/validate -----------------
router.get('/validate', (req, res) =>{
   // get token from header
   const token = req.headers['authorization'].split(' ')[1]
   // validate the token using jwt.verify()
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, tokenData) => {
      if(err){
         // token invalid
         // send a 403 respone
         return res.sendStatus(403)
      }else{
         // token must be valid
         // send back the tokenData (Decrypted) as respone
         res.json(tokenData)
      }
   })
})

module.exports = router