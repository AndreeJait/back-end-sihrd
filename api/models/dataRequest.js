const mongoose = require('mongoose')
const dataRequestSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dosen: { type: mongoose.Schema.Types.ObjectId, ref: "dosens" },
    token: { type: String, require: true },
    nama: { type: String, require: true },
    no_telepon: { type: String, require: true },
    email: { type: String, require: true },
    status: { type: String, default: "menunggu" },
    date_expired: { type: Date, require: true }
})
module.exports = mongoose.model("data_request", dataRequestSchema)