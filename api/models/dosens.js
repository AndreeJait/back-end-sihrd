const mongoose = require('mongoose')
const dosensSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, require: true },
    nip: { type: String, require: true },
    nama_lengkap: { type: String, require: true },
    tanggal_rekrut: { type: Date, require: true },
    profile: { type: String, default: "uploads/dosen/default_img_profile.png" },
    hasil_test: { type: String, default: 0 },
    data_diri: { type: mongoose.Schema.Types.ObjectId, ref: "data_diri", default: null },
    data_pendidikan: [{ type: mongoose.Schema.Types.ObjectId, ref: "data_pendidikan" }],
    data_keluarga: { type: mongoose.Schema.Types.ObjectId, ref: "data_keluarga", default: null },
    data_jabatan: [{ type: mongoose.Schema.Types.ObjectId, ref: "data_jabatan" }],
    data_sertifikasi: [{ type: mongoose.Schema.Types.ObjectId, ref: "data_sertfikasi" }],
    data_pangkat: [{ type: mongoose.Schema.Types.ObjectId, ref: "data_pangkat" }],
})
module.exports = mongoose.model('dosens', dosensSchema)