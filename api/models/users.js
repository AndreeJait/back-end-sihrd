const mongoose = require('mongoose')
const hrdSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, require: true },
    password: { type: String, require: true },
    email: { type: String, require: true },
    email_pribadi: { type: String, require: true },
    no_telepon: { type: String, require: true },
    profile: { type: String, require: true },
    role: { type: String, default: "hrd" }
})

module.exports = mongoose.model('users', hrdSchema)