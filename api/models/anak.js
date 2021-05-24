const mongoose = require('mongoose')
const anakSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    nik: { type: String, require: true },
    nama: { type: String, require: true },
    tanggal_lahir: { type: Date, require: true },
    tempat_lahir: { type: String, require: true },
    jenis_kelamin: { type: String, require: true },
    dalam_tanggungan: { type: Boolean, default: true },
})
module.exports = mongoose.model("anak", anakSchema)