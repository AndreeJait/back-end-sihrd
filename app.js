// Declare all library
const express = require('express')
const morgan = require('morgan')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
    // const middlewareAuth = require('./api/middleware/check-api')
    // const apiKeyAuth = require('api-key-auth')
    // Call all router
const UsersRoute = require('./api/routes/users')
const DosenRoute = require('./api/routes/dosens')
const RequestRoute = require('./api/routes/request')
const notifJabatan = require('./api/controllers/notifJabatan')
const notifPemangkatan = require('./api/controllers/notifPemangkatan')
    // app.use(apiKeyAuth({ getSecret: middlewareAuth }))

// use all library
app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use('/uploads/hrd', express.static('uploads/hrd'))
app.use('/uploads/dosen', express.static('uploads/dosen'))
    // Connect to MongooDB
const db_url = "mongodb+srv://andre:" + process.env.MONGOOSE_DB_PW + "@cluster0.oyggo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(db_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(res => {
    console.log("connect succesfully")
    notifJabatan()
    notifPemangkatan()
}).catch(err => {
    console.log("Can't connect to db")
})
mongoose.set('useFindAndModify', false);
// Use all router
app.use('/users', UsersRoute)
app.use('/dosen', DosenRoute)
app.use('/data', RequestRoute)
    // Handling page not found -- Error
app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})
module.exports = app