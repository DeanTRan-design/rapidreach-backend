// User routes
const express = require("express")
const router = express.Router()
const User = require("./../models/User")
const fs = require("fs");
const path = require("path");
const { utils, upload, sharp} = require("../Utils");

// GET - get all user------------------------------------------------
router.get('/', (req, res) => {
    // get all users from the User model, using the find() method
    User.find()
        .then(users => {
            return res.status(200).json(users)
        })
        .catch(err => {
            console.log("promblem getting user", err)
        })
})

// GET - get a single user by id--------------------------------------
// endpoint = /user/:id
// Dean Tran id = 67c5a78748ffe13405686146
router.get('/:id', (req, res) => {
    // use the User model find One user by id
    User.findById(req.params.id)
    .then(user => {
        if(!user){
            return res.status(400).json({
                message: "user doesn't exist"  
            })
        }else{
            return res.json(user)
        }
        console.json(user)
    })
    .catch(err => {
        console.log("error getting user", err)
    })
})

// POST - create new user---------------------------------------------
// endpoint = /user
router.post('/', async (req, res) => {
    // check if the req.body is empty, if so - send back error
    if(!req.body) {
        return res.status(400).json({
            message: "user content is empty"
        })
    }
    
    await User.findOne({email: req.body.email})
        .then(user =>{
            if(user != null){
                return res.status(400).json({
                    message: "email already in use"
                })
            }
        })

            // create a new user using the User model
            const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                dob: req.body.dob,
                city: req.body.city,
                email: req.body.email,
                accessLevel: req.body.accessLevel,
                password: utils.hashPassword(req.body.password)
            })

            // save newUser document to database
            newUser.save()
            // send back 201 status and user object
                .then(user => {
                    return res.status(201).json(user)
                })
                .catch(err => {
                 console.log("error creating user", err)
                 // send back 500 status with error message
                    return res.status(500).json({
                        message: "problem creating user",
                        error: err
                    })
                })
            
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                message: "problem creating account"
            })
        })
})

// PUT - update avatar image for a user------------------------------------
// endpoint: /user/:id/avatar
router.put("/:id/avatar", upload.single("avatar"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const filename = `avatar-${Date.now()}.jpeg`;
        const outputPath = path.join(__dirname, "../uploads", filename);

        // Process and save the image using sharp
        await sharp(req.file.buffer)
            .resize(150, 150)
            .jpeg({ quality: 80 })
            .toFile(outputPath);

        // Update user with the avatar filename
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { avatar: filename },
            { new: true }
        );

        return res.status(200).json({
            message: "Avatar uploaded successfully",
            avatarURL: "https://rapidreach-backend-guki.onrender.com/uploads/${filename}",
            user,
        });
    } catch (err) {
        console.error("Error uploading avatar:", err);
        return res.status(500).json({ message: "Server error during image upload" });
    }
});

// PUT - update user by id--------------------------------------------
// endpoint = /user/:id
router.put('/:id', (req, res) =>{
    // check if the req.body is empty, if so - send back error
    if(!req.body) {
        return res.status(400).json({
            message: "user content is empty"
        })
    }
    // update user using the User model
    User.findByIdAndUpdate(req.params.id, req.body)
    .then(user => {
        return res.json(user)
    })
    .catch(err => {
        console.log("error updating user", err)
        // send back 500 status with error message
        return res.status(500).json({
            message: "problem updating user",
            error: err
        })
    })

})

// DELETE - delete user by id-----------------------------------------
// endpoint = /user/:id
router.delete("/:id", (req, res) =>{
    // validate the request (make sure id isn't missing)
    if(!req.params.id){
        return res.status(400).json({
            message: "user id is missing"
        })
    }
    // delete the user using the User model
    User.findOneAndDelete({_id: req.params.id})
    .then(() => {
        return res.json({
           message: "User deleted"
        })
    })
    .catch(err => {
        console.log("error deleting user", err)
        // send back 500 status with error message
        return res.status(500).json({
            message: "problem deleting user",
            error: err
        })
    })
})

// export
module.exports = router