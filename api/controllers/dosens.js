const Dosens = require('../models/dosens')
const DataDiri = require('../models/dataDiri')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const fs = require('fs')
const { promisify } = require('util')
const dataPendidikan = require('../models/dataPendidikan')
const DataKeluarga = require('../models/dataKeluarga')
const Anak = require('../models/anak')
const dataJabatan = require('../models/dataJabatan')
const dataPemangkatan = require('../models/dataPemangkatan')
const dataSertifikasi = require('../models/dataSertifikasi')
const { EEXIST } = require('constants')
const e = require('express')
const dataKeluarga = require('../models/dataKeluarga')
const unlinkAsync = promisify(fs.unlink)
exports.add_new_dosen_data_diri = (req, res, next) => {
    Dosens.find({ nip: req.body.nip, email: req.body.email }).exec()
        .then(result => {
            if (result.length) {
                unlinkAsync(req.file.path)
                res.status(401).json({
                    msg: "Email Already exist in db!"
                })
            } else {
                let new_dosens = new Dosens({
                    _id: mongoose.Types.ObjectId(),
                    email: req.body.email,
                    nip: req.body.nip,
                    tanggal_rekrut: new Date(req.body.tanggal_rekrut),
                    profile: req.file.path,
                    hasil_test: req.body.hasil_test,
                    data_diri: null,
                    nama_lengkap: req.body.nama_lengkap,
                })
                new_dosens.save()
                    .then(result => {
                        let new_dataDiri = new DataDiri({
                            _id: mongoose.Types.ObjectId(),
                            jenis_kelamin: req.body.jenis_kelamin,
                            tempat_lahir: req.body.tempat_lahir,
                            tanggal_lahir: new Date(req.body.tanggal_lahir),
                            agama: req.body.agama,
                            dosen: new_dosens._id,
                            provinsi: req.body.provinsi,
                            alamat: req.body.alamat,
                            email_pribadi: req.body.email_pribadi,
                            kode_pos: Number(req.body.kode_pos),
                            no_telepon: req.body.no_telepon
                        })
                        new_dataDiri.save()
                            .then(result_data_diri => {
                                Dosens.updateOne({ _id: new_dosens._id }, { data_diri: new_dataDiri._id })
                                    .exec()
                                    .then(result => {
                                        res.status(200).json({
                                            msg: "Success to add",
                                            id: new_dosens._id
                                        })
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            msg: err
                                        })
                                    })
                            })
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({
                            error: err
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        unlinkAsync(req.file.path)
                        res.status(500).json({
                            error: err
                        })
                    })
            }
        }).catch(err => {
            // unlinkAsync(req.file.path)
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}
exports.get_all_dosen = (req, res, next) => {
    let key = {}
    if (req.body.nama_lengkap !== undefined) {
        key["nama_lengkap"] = { $regex: '.*' + req.body.nama_lengkap + '.*', $options: 'i' }
    }
    if (req.body.nip !== undefined) {
        key["nip"] = req.body.nip
    }
    if (req.body.email !== undefined) {
        key["email"] = req.body.email
    }
    let jenis_kelamin = ""
    if (req.body.jenis_kelamin !== undefined) {
        jenis_kelamin = req.body.jenis_kelamin
    }
    let pendidikan = "";
    if (req.body.pendidikan !== undefined) {
        pendidikan = req.body.pendidikan
    }
    Dosens.find(key)
        .populate("data_diri")
        .populate("data_pendidikan")
        .populate({ path: "data_keluarga", populate: { path: "anak" } })
        .populate("data_jabatan")
        .populate("data_pangkat")
        .skip(Number(req.body.skip))
        .limit(Number(req.body.limit))
        .exec()
        .then(result => {
            let finish = result
            if (pendidikan !== "") {
                finish = result.filter((data) => { return pendidikan === "" ? true : data.data_pendidikan.filter((e) => e.nama_pendidikan === pendidikan).length > 0 })
            }
            if (jenis_kelamin !== "") {
                finish = finish.filter((data) => { return data.data_diri.jenis_kelamin === jenis_kelamin })
            }
            res.status(200).json({
                dosens: finish
            })
        }).catch(err => {
            res.status(500).json({
                msg: err
            })
        })
}
exports.get_count_dosen = (req, res, next) => {
    Dosens.count({})
        .then(result => {
            res.status(200).json({
                total: result
            })
        })
        .catch(err => {
            res.status(500).json({
                msg: "Internal server error"
            })
        })
}
exports.add_data_pendidikan_dosen = (req, res, next) => {
    let idDosen = req.params.idDosen
    let temp_pendidikan = []
    let ids = []
    req.body.studies.map((item, index) => {
        item["_id"] = mongoose.Types.ObjectId()
        item["dosen"] = mongoose.Types.ObjectId(idDosen)
        ids.push(item._id)
        temp_pendidikan.push(item)
    })
    dataPendidikan.insertMany(temp_pendidikan)
        .then(result => {
            Dosens.updateOne({ _id: req.params.idDosen }, { data_pendidikan: temp_pendidikan })
                .exec()
                .then(result => {
                    res.status(200).json({
                        msg: "Succes to add"
                    })
                }).catch(err => {
                    res.status(500).json({
                        msg: "Internal server error!"
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                msg: "Internal server error!"
            })
        })
}
exports.add_data_keluarga = (req, res, next) => {
    let anak = req.body.anak
    console.log(anak)
    let temp_anak = []
    let id = []
    let nik = []
    anak.map((item, index) => {
        item["_id"] = mongoose.Types.ObjectId()
        item["dalam_tanggungan"] = item["dalam_tanggungan"] === "ya" ? true : false
        id.push(item._id)
        nik.push(item.nik)
        temp_anak.push(new Anak(item))
    })
    Anak.insertMany(temp_anak)
        .then(result => {
            let newDataKeluarga = new DataKeluarga({
                _id: mongoose.Types.ObjectId(),
                alamat_keluarga: req.body.alamat_keluarga,
                nama_pasangan: req.body.nama_pasangan,
                pekerjaan_pasangan: req.body.pekerjaan_pasangan,
                no_telepon_pasangan: req.body.no_telepon_pasangan,
                nik_pasangan: req.body.nik_pasangan,
                agama_pasangan: req.body.agama_pasangan,
                nik: req.body.nik,
                no_kartu_keluarga: req.body.no_kartu_keluarga,
                id_bpjs: req.body.id_bpjs,
                tanggal_lahir_pasangan: new Date(req.body.tanggal_lahir),
                tempat_lahir_pasangan: req.body.tempat_lahir,
                anak: id,
                id_bpjs: req.body.id_bpjs
            })
            newDataKeluarga.save()
                .then(result => {
                    Dosens.updateOne({ _id: req.params.idDosen }, { data_keluarga: newDataKeluarga._id })
                        .exec()
                        .then(result => {
                            res.status(200).json({
                                msg: "Succes to add",
                                _id: newDataKeluarga._id
                            })
                        }).catch(err => {
                            res.status(500).json({
                                msg: "Internal server error!"
                            })
                        })
                })
                .catch(err => {
                    res.status(500).json({
                        msg: "Internal server error!"
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                msg: "Internal server error!"
            })
        })
}
exports.add_data_jabatan = (req, res, next) => {
    let idDosen = req.params.idDosen
    let ids = []
    let jabatans = []
    req.body.jabatans.map((item, index) => {
        item["_id"] = mongoose.Types.ObjectId()
        item.tanggal_berlaku = new Date(item.tanggal_berlaku)
        item.tanggal_berakhir = new Date(item.tanggal_berakhir)
        item["dosen"] = mongoose.Types.ObjectId(idDosen)
        jabatans.push(item)
        ids.push(item._id)
    })
    dataJabatan.insertMany(jabatans)
        .then(result => {
            Dosens.updateOne({ _id: idDosen }, { data_jabatan: ids })
                .exec()
                .then(result => {
                    res.status(200).json({
                        msg: "Success to add"
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        msg: "Internal server error"
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                msg: "Internal server error"
            })
        })
}
exports.add_data_pemangkatan = (req, res, next) => {
    let idDosen = req.params.idDosen
    let ids = []
    let kepangkatans = []
    req.body.kepangkatans.map((item, index) => {
        item["_id"] = mongoose.Types.ObjectId()
        item["dosen"] = mongoose.Types.ObjectId(idDosen)
        item.tanggal_kenaikan = new Date(item.tanggal_kenaikan)
        kepangkatans.push(item)
        ids.push(item._id)
    })
    dataPemangkatan.insertMany(kepangkatans)
        .then(result => {
            if (result.length > 0) {
                Dosens.updateOne({ _id: idDosen }, { data_pangkat: ids })
                    .exec()
                    .then(result => {
                        return res.status(200).json({
                            msg: "Success to add"
                        })
                    })
                    .catch(err => {
                        return res.status(500).json({
                            msg: "Internal server error"
                        })
                    })
            } else {
                return res.status(204).json({
                    msg: "Tidak ada data yang ditambahkan"
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                msg: "Internal server error"
            })
        })
}
exports.add_data_sertifikasi = (req, res, next) => {
    let idDosen = req.params.idDosen
    let ids = []
    let sertifikasi = []
    req.body.sertifikasi.map((item, index) => {
        item["_id"] = mongoose.Types.ObjectId()
        item["dosen"] = mongoose.Types.ObjectId(idDosen)
        item.tanggal_kenaikan = new Date(item.tanggal_kenaikan)
        sertifikasi.push(item)
        ids.push(item._id)
    })
    dataSertifikasi.insertMany(sertifikasi)
        .then(result => {
            console.log(result.length)
            if (result.length > 0) {
                Dosens.updateOne({ _id: idDosen }, { data_sertifikasi: ids })
                    .exec()
                    .then(result => {
                        return res.status(200).json({
                            msg: "Success to add"
                        })
                    })
                    .catch(err => {
                        return res.status(500).json({
                            msg: "Internal server error"
                        })
                    })
            } else {
                return res.status(204).json({
                    msg: "Tidak ada data yang ditambahkan"
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                msg: "Internal server error"
            })
        })
}
exports.update_data_diri_dosen = (req, res, next) => {
    Dosens.findOneAndUpdate({ _id: req.params.idDosen }, {
            email: req.body.email,
            nip: req.body.nip,
            tanggal_rekrut: new Date(req.body.tanggal_rekrut),
            profile: req.file.path,
            hasil_test: req.body.hasil_test,
            nama_lengkap: req.body.nama_lengkap,
        })
        .exec()
        .then(result => {
            unlinkAsync(result.profile)
            DataDiri.findOneAndUpdate({ _id: result._id }, {
                    jenis_kelamin: req.body.jenis_kelamin,
                    tempat_lahir: req.body.tempat_lahir,
                    tanggal_lahir: new Date(req.body.tanggal_lahir),
                    agama: req.body.agama,
                    provinsi: req.body.provinsi,
                    alamat: req.body.alamat,
                    email_pribadi: req.body.email_pribadi,
                    kode_pos: Number(req.body.kode_pos),
                    no_telepon: req.body.no_telepon
                }).exec()
                .then(result => {
                    res.status(200).json({
                        msg: "Succes to update data!"
                    })
                }).catch(err => {
                    res.status(500).json({
                        msg: "Internal server error!"
                    })
                })
        }).catch(err => {
            unlinkAsync(req.file.path)
            res.status(500).json({
                msg: err.toString()
            })
        })
}
exports.delete_data_dosen = async(req, res, next) => {
    let id = req.params.idDosen
    Dosens.findOneAndDelete({ _id: id })
        .exec()
        .then(result => {
            unlinkAsync(result.profile)
            DataDiri.deleteMany({ _id: result.data_diri })
                .exec()
                .then(result => {
                    res.status(200).json({
                        msg: "Succes to delete"
                    })
                }).catch(err => {
                    res.status(500).json({
                        msg: "Internal Server Error"
                    })
                })
        }).catch(err => {
            res.status(500).json({
                msg: "Internal Server Error"
            })
        })
}
exports.delete_data_keluarga = (req, res, next) => {
    let id = req.params.idDosen
    DataKeluarga.findOneAndDelete({ dosen: id })
        .then(result => {
            Anak.deleteMany({ _id: { $in: result.anak } })
                .then(result => {
                    res.status(200).json({
                        msg: "Succes to delete"
                    })
                }).catch(err => {
                    res.status(500).json({
                        msg: "Internal Server Error"
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                msg: "Internal Server Error"
            })
        })
}
exports.delete_data_pendidikan = (req, res, next) => {
    let id = req.params.idDosen
    dataPendidikan.deleteMany({ dosen: id }).then(result => {
        res.status(200).json({
            msg: "Succes to delete"
        })
    }).catch(err => {
        res.status(500).json({
            msg: "Internal Server Error"
        })
    })
}
exports.delete_data_jabatan = (req, res, next) => {
    let id = req.params.idDosen
    dataJabatan.deleteMany({ dosen: id }).then(result => {
        res.status(200).json({
            msg: "Succes to delete"
        })
    }).catch(err => {
        res.status(500).json({
            msg: "Internal Server Error"
        })
    })
}
exports.delete_data_pangkat = (req, res, next) => {
    let id = req.params.idDosen
    dataPemangkatan.deleteMany({ dosen: id }).then(result => {
        res.status(200).json({
            msg: "Succes to delete"
        })
    }).catch(err => {
        res.status(500).json({
            msg: "Internal Server Error"
        })
    })
}
exports.delete_data_sertifikasi = (req, res, next) => {
    let id = req.params.idDosen
    dataSertifikasi.deleteMany({ dosen: id }).then(result => {
        res.status(200).json({
            msg: "Succes to delete"
        })
    }).catch(err => {
        res.status(500).json({
            msg: "Internal Server Error"
        })
    })
}
exports.search_dosen_by_nip_name = (req, res, next) => {
    let key = req.body.key
    Dosens.find({
            $or: [
                { email: { $regex: '.*' + key + '.*', $options: 'i' } },
                { nip: key },
                { nama_lengkap: { $regex: '.*' + key + '.*', $options: 'i' } }
            ]
        }).collation({ locale: 'en', strength: 2 })
        .select("nip profile email nama_lengkap")
        .exec().then(result => {
            if (result.length) {
                res.status(200).json({
                    dosens: result
                })
            } else {
                res.status(404).json({
                    msg: "No data exist!"
                })
            }
        }).catch(err => {
            res.status(500).json({
                msg: "Internal Server Error"
            })
        })
}
exports.get_jabatan_active = (req, res, next) => {
    let today = new Date()
    dataJabatan.find({ tanggal_berlaku: { $lt: today }, tanggal_berakhir: { $gte: today } })
        .populate("dosen")
        .exec()
        .then(result => {
            if (result.length) {
                res.status(200).json({
                    data: result
                })
            } else {
                res.status(404).json({
                    message: "No data found !"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal server error!"
            })
        })
}
exports.get_dosen_in_study = (req, res, next) => {
    let today = new Date()
    dataPendidikan.find({ tanggal_masuk: { $lt: today }, tanggal_selesai: { $gte: today } })
        .populate("dosen")
        .exec()
        .then(result => {
            if (result.length) {
                res.status(200).json({
                    data: result
                })
            } else {
                res.status(404).json({
                    message: "No data found !"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal server error!"
            })
        })
}
exports.get_dosen_by_id = (req, res, next) => {
    Dosens.findOne({ _id: req.params.idDosen })
        .populate("data_diri")
        .populate("data_pendidikan")
        .populate({ path: "data_keluarga", populate: { path: "anak" } })
        .populate("data_jabatan")
        .populate("data_pangkat")
        .exec()
        .then(result => {
            res.status(200).json({
                dosen: result
            })
        }).catch(err => {
            res.status(500).json({
                msg: "Internal server error"
            })
        })
}

exports.pemangkatan_yang_akan_terjadi = (req, res, next) => {
    let today = new Date()
    let start = new Date(today.getTime() - (4 * 365 * 60 * 24 * 60 * 1000) - (4 * 60 * 60 * 24 * 1000))
    let limit = new Date(today.getTime() - (4 * 365 * 60 * 24 * 60 * 1000) + (4 * 60 * 60 * 24 * 1000))
    dataPemangkatan.find({ 'tanggal_kenaikan': { $gte: start, $lte: limit } })
        .populate("dosen")
        .exec()
        .then(result => {
            res.status(200).json({
                data: result
            })
        })
        .catch(err => {
            res.status(500).json({
                msg: "Internal server error!"
            })
        })
}
exports.jabatan_akan_berakhir = (req, res, next) => {
    let today = new Date()
    let limit = new Date(today.getTime() + (10 * 60 * 24 * 60 * 1000))
    dataJabatan.find({ tanggal_berakhir: { $gte: today, $lt: limit } })
        .populate("dosen")
        .exec()
        .then(result => {
            res.status(200).json({
                data: result
            })
        })
        .catch(err => {
            res.status(500).json({
                msg: "Internal server error !"
            })
        })
}