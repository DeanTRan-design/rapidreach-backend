// dependencies
const mongoose = require('mongoose')
const Utils = require('../Utils')
const Schema = mongoose.Schema
require('mongoose-type-email')

// schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true
    },
    accessLevel: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: { 
        type: String,
        default: '' 
    }
}, { timestamps: true })


// hash password (middleware)--------------------------------
userSchema.pre('save', function(next){
    // check if password is present and is modified
    if( this.password && this.isModified() ){
        // replace original password with new hashed password
        this.password = Utils.hashPassword(this.password);
    }
    // continue
    next()
})


// create mongoose Model
const userModel = mongoose.model('User', userSchema)

// export
module.exports = userModel