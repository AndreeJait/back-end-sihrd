const mongoose = require('mongoose')
const dataDiriSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dosen: { type: mongoose.Schema.Types.ObjectId, ref: "dosens" },
    jenis_kelamin: { type: String, require },
    tempat_lahir: { type: String, require },
    tanggal_lahir: { type: Date, require },
    agama: { type: String, require },
    alamat: { type: String, require },
    email_pribadi: { type: String, require },
    kode_pos: { type: Number, require },
    no_telepon: { type: String, require },
})
module.exports = mongoose.model('data_diri', dataDiriSchema)