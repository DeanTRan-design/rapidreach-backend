// dependencies
require("dotenv").config()
let crypto = require('crypto')
const jwt = require('jsonwebtoken')
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

// Utils class
class utils {

    // take the passwords and hashes it (encrypts)
    hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex')
        return [salt, hash].join('$')
    }

    // checks a password against the original and return true/false if verify
    verifyPassword(password, original) {
        const originalHash = original.split('$')[1]
        const salt = original.split('$')[0]
        const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex')
        return hash === originalHash 
    }

    generateAccessToken(user){
        return jwt.sign({_id: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30 mins'})
    }
}

// Set up multer for image upload
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (extname && mimeType) cb(null, true);
    else cb("Only JPEG and PNG images allowed");
  },
});

// Export utils, multer, and sharp
module.exports = {
  utils: new utils(),
  upload,
  sharp,
};