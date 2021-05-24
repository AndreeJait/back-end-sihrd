const mongoose = require('mongoose')
const dataPendidikanSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dosen: { type: mongoose.Schema.Types.ObjectId, ref: "dosens" },
    nama_pendidikan: { type: String, require: true },
    nama_instansi: { type: String, require: true },
    tanggal_masuk: { type: Date, require: true },
    tanggal_selesai: { type: Date, require: true },
    nilai_akhir: { type: Number, require: true },
    jurusan: { type: String, require: true },
})
module.exports = mongoose.model("data_pendidikan", dataPendidikanSchema)