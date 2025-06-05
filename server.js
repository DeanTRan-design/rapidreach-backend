// Server
// dependencies-----------------------------------------------
require("dotenv").config()
const bodyParser = require("body-parser")
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const fs = require("fs");
const path = require("path");
const port = process.env.PORT || 3000

// database connection----------------------------------------
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,      
})
    .then(() =>{
        console.log("db connected!")
    })
    .catch((err) =>{
        console.log("db connection fail!", err)
    })

// express app set up-----------------------------------------
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use('*', cors())
app.use("/uploads", express.static("uploads"));

// routes-----------------------------------------------------
// homepage
app.get('/', (req, res) => {
    res.send("Home Page")
})

// user
const userRouter = require ("./routes/user")
app.use("/user", userRouter)

// auth
const authRouter = require ("./routes/auth")
app.use("/auth", authRouter)

// report
const reportRouter = require("./routes/report");
app.use("/report", reportRouter)

// Create uploads folder if it doesn't exist (on Render)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// run app (listen on port)-----------------------------------
app.listen(port, () => {
    console.log("App is running on port", port);
})

// http://localhost:3000