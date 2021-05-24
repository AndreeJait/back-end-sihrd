const mongoose = require('mongoose')
const dataPemangkatanSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dosen: { type: mongoose.Schema.Types.ObjectId, ref: "dosens" },
    nama: { type: String, require: true },
    tanggal_kenaikan: { type: Date, require: true },
})
module.exports = mongoose.model("data_pangkat", dataPemangkatanSchema)