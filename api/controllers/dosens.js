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
const unlinkAsync = promisify(fs.unlink)
exports.add_new_dosen_data_diri = (req, res, next) => {
    Dosens.find({ nip: req.body.nip }).exec()
        .then(result => {
            console.log(result.length)
            if (result.length) {
                unlinkAsync(result[0].profile)
                return res.status(409).json({
                    msg: "Data already exist in db!"
                })
            } else {
                let new_dosens = new Dosens({
                    _id: mongoose.Types.ObjectId(),
                    email: req.body.email,
                    nip: req.body.nip,
                    tanggal_rekrut: req.body.tanggal_rekrut,
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
                                            msg: "Success to add"
                                        })
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            msg: err
                                        })
                                    })
                            })
                    }).catch(err => {
                        res.status(500).json({
                            error: err
                        })
                    })
                    .catch(err => {
                        unlinkAsync(req.file.path)
                        res.status(500).json({
                            error: err
                        })
                    })
            }
        }).catch(err => {
            unlinkAsync(req.file.path)
            res.status(500).json({
                error: err
            })
        })
}
exports.get_all_dosen = (req, res, next) => {
    Dosens.find({})
        .populate("data_diri")
        .populate("data_pendidikan")
        .populate({ path: "data_keluarga", populate: { path: "anak" } })
        .populate("data_jabatan")
        .populate("data_pangkat")
        .exec()
        .then(result => {
            res.status(200).json({
                dosens: result
            })
        }).catch(err => {
            res.status(500).json({
                msg: err
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
    let anak = req.body.anaks
    let temp_anak = []
    let id = []
    let nik = []
    anak.map((item, index) => {
        item["_id"] = mongoose.Types.ObjectId()
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
                nik: req.body.nik,
                no_kartu_keluarga: req.body.no_kartu_keluarga,
                id_bpjs: req.body.id_bpjs,
                tanggal_lahir_pasangan: new Date(req.body.tanggal_lahir),
                tempat_lahir_pasangan: req.body.tempat_lahir,
                anak: id
            })
            newDataKeluarga.save()
                .then(result => {
                    Dosens.updateOne({ _id: req.params.idDosen }, { data_keluarga: newDataKeluarga._id })
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
            console.log(result.length)
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
    Dosens.updateOne({ _id: req.body._id }, dosen)
        .exec()
        .then()
        .result()
}
exports.update_data_pendidikan = (req, res, next) => {

}
exports.update_data_jabatan = (req, res, next) => {

}
exports.update_data_pangkat = (req, res, next) => {

}
exports.update_data_sertifikasi = (req, res, next) => {

}
exports.update_data_keluarga = (req, res, next) => {

}
exports.update_data_anak = (req, res, next) => {

}

exports.delete_data_diri_dosen = (req, res, next) => {

}
exports.delete_data_pendidikan = (req, res, next) => {

}
exports.delete_data_jabatan = (req, res, next) => {

}
exports.delete_data_pangkat = (req, res, next) => {

}
exports.delete_data_sertifikasi = (req, res, next) => {

}
exports.delete_data_keluarga = (req, res, next) => {

}
exports.delete_data_anak = (req, res, next) => {

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