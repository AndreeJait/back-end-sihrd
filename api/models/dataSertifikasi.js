const mongoose = require('mongoose')
const dataSertifikasiSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dosen: { type: mongoose.Schema.Types.ObjectId, ref: "dosens" },
    no_registrasi: { type: String, require: true },
    nama: { type: String, require: true },
    tanggal_sertifikasi: { type: Date, require: true },
})
module.exports = mongoose.model("data_sertifikasi", dataSertifikasiSchema)