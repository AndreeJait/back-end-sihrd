const mongoose = require('mongoose')
const dataKeluargaSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    alamat_keluarga: { type: String, require: true, default: null },
    nama_pasangan: { type: String, require: true, default: null },
    pekerjaan_pasangan: { type: String, require: true, default: null },
    no_telepon_pasangan: { type: String, require: true, default: null },
    nik_pasangan: { type: String, require: true, default: null },
    no_kartu_keluarga: { type: String, require: true, default: null },
    tanggal_lahir_pasangan: { type: String, require: true, default: null },
    tempat_lahir_pasangan: { type: Date, require: true },
    id_bpjs: { type: String, require: true, default: null },
    nik: { type: String, require: true, default: null },
    anak: [{ type: mongoose.Schema.Types.ObjectId, ref: "anak" }],
    dosen: { type: mongoose.Schema.Types.ObjectId, ref: "dosens" }
})
module.exports = mongoose.model("data_keluarga", dataKeluargaSchema)