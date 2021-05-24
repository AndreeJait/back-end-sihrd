const mongoose = require('mongoose')
const dataJabatanSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dosen: { type: mongoose.Schema.Types.ObjectId, ref: "dosens" },
    nama_jabatan: { type: String, require: true },
    tanggal_berlaku: { type: Date, require: true },
    tanggal_berakhir: { type: Date, require: true },
})
module.exports = mongoose.model("data_jabatan", dataJabatanSchema)