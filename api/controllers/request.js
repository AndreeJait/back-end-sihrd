const e = require("express")
const mongoose = require("mongoose")
const transporter = require("../../config/nodemailer")
const dataRequest = require("../models/dataRequest")
const dosens = require("../models/dosens")
const notification = require("../models/notifications")

exports.request_data_dosen = (req, res, next) => {
    let nama = req.body.nama
    let email = req.body.email
    let no_telepon = req.body.no_telepon
    let id_dosen = req.body.id_dosen
    let token = Math.random().toString(36).replace(/[^a-z]+/, '').substr(0, 5)
    let date = new Date((new Date()).getTime() + 43200000)
    dataRequest.findOne({ email: email })
        .exec()
        .then(result => {
            if (result === null) {
                let new_request = new dataRequest({
                    _id: mongoose.Types.ObjectId(),
                    dosen: id_dosen,
                    token: token,
                    date_expired: date,
                    no_telepon: no_telepon,
                    nama: nama,
                    email: email,
                    status: "menunggu"
                })
                new_request.save()
                    .then(result => {
                        let today = new Date();
                        let new_notif = new notification({
                            _id: mongoose.Types.ObjectId(),
                            content: "Satu request data dosen dengan id " + id_dosen + " mengingkan konfirmasi anda",
                            tanggal_notif: today
                        })
                        new_notif.save()
                            .then(result => {
                                res.status(200).json({
                                    message: "Success to request!"
                                })
                            }).catch(err => {
                                console.log(err)
                                res.status(400).json({
                                    message: "Failed to add notifications"
                                })
                            })
                    }).catch(err => {
                        res.status(400).json({
                            message: "Failed to add data"
                        })
                    })
            } else {
                if (result.status === "menunggu") {
                    res.status(409).json({
                        message: "Opss, you already have request to this data!"
                    })
                } else {
                    dataRequest.updateOne({ _id: result._id }, { status: "menunggu", date_expired: date, token: token })
                        .then(result => {
                            let today = new Date();
                            let new_notif = new notification({
                                _id: mongoose.Types.ObjectId(),
                                content: "Satu request data dosen dengan id " + id_dosen + " mengingkan konfirmasi anda",
                                tanggal_notif: today
                            })
                            new_notif.save()
                                .then(result => {
                                    res.status(200).json({
                                        message: "Success to request!"
                                    })
                                }).catch(err => {
                                    console.log(err)
                                    res.status(400).json({
                                        message: "Failed to add notifications"
                                    })
                                })
                        })
                }
            }
        })
}
exports.take_data_dosen = (req, res, next) => {
    let token = req.body.token
    let email = req.body.email

    dataRequest.findOne({ token: token, email: email }).exec()
        .then(result => {
            let expired = new Date(result.date_expired).getTime()
            let now = new Date().getTime()
            if (expired > now) {
                dosens.findOne({ _id: result.dosen })
                    .populate("data_diri")
                    .populate("data_pendidikan")
                    .populate({ path: "data_keluarga", populate: { path: "anak" } })
                    .populate("data_jabatan")
                    .populate("data_pangkat")
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: "Succes to get data",
                            data_dosen: result
                        })
                    })
                    .catch(err => {
                        res.status(404).json({
                            message: "Data not found!"
                        })
                    })
            } else {
                res.status(401).json({
                    message: "Token Expired"
                })
            }

        })
        .catch(error => {
            res.status(500).json({
                message: "Internal Server Error"
            })
        })

}
exports.confirm_data_dosen = (req, res, next) => {
    let id = req.body.id_request
    let status = req.body.status
    let date = new Date((new Date()).getTime() + 43200000)
    dataRequest.findOneAndUpdate({ _id: id, status: "menunggu" }, { status: status, date_expired: date }, false)
        .exec()
        .then(result => {
            if (result !== null) {
                let mailOptions = {}
                if (status === "diterima") {
                    mailOptions = {
                        from: 'panjaitanandree@gmail.com',
                        to: result.email,
                        subject: 'Response Request Data Applikasi SI HRD',
                        html: '<p>Thank you for wait our response, your token is <b style="font-size: 24px;">' + result.token + '<b></p>'
                    }
                } else {
                    mailOptions = {
                        from: 'panjaitanandree@gmail.com',
                        to: result.email,
                        subject: 'Response Request Data Applikasi SI HRD',
                        html: '<h3 style="color: red;">Sorry we can accept your request because some reason !</h3>'
                    }
                }
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log(err)
                        res.status(401).json({
                            message: "Failed to send email"
                        })
                    } else {
                        res.status(200).json({
                            message: "Succes to confirmation"
                        })
                    }
                })
            } else {
                res.status(404).json({
                    message: "No data found"
                })
            }
        }).catch(err => {
            res.status(500).json({
                err: "Internal Server Error"
            })
        })
}
exports.doing_read_notif = (req, res, next) => {
    console.log(req.body.userId)
    notification.updateOne({ _id: req.body._id }, { $addToSet: { isRead: req.body.userId } })
        .exec()
        .then(result => {
            res.status(200).json({
                result: result
            })
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal server error"
            })
        })
}
exports.get_all_notif = (req, res, next) => {
    notification.find({})
        .sort({ tanggal_notif: "DESC" })
        .skip(Number(req.params.offset))
        .exec()
        .then(result => {
            if (result.length > 0) {
                res.status(200).json({
                    notif: result
                })
            } else {
                res.status(404).json({
                    message: "We don't have a new notif"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal server Error"
            })
        })
}