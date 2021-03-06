const mongoose = require("mongoose")
const pusher = require("../../config/pusher")
const dataJabatan = require("../models/dataJabatan")
const notifications = require("../models/notifications")

const handleAction = () => {
    return new Promise((resolve, reject) => {
        let today = new Date()
        let limit = new Date(today.getTime() + (10 * 60 * 24 * 60 * 1000))
        dataJabatan.find({ tanggal_berakhir: { $gte: today, $lt: limit } })
            .exec()
            .then(result => {
                if (result.length) {
                    result.map((item, index) => {
                        let strDate = new Date(item.tanggal_berakhir)
                        let content = "Jabatan " + item.nama_jabatan + " akan berakhir pada tanggal " + strDate.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", month: "long", year: "numeric", day: "numeric" }) + " !"
                        notifications.find({ content: content })
                            .exec()
                            .then(result => {
                                if (!result.length) {
                                    console.log("Aneh")
                                    let new_notif = new notifications({
                                        _id: mongoose.Types.ObjectId(),
                                        content: content,
                                        tanggal_notif: new Date(),
                                    })
                                    new_notif.save()
                                        .then(result => {
                                            console.log("Make notif")
                                            pusher.trigger("my-channel", "req-token", {
                                                message: "Request Notif"
                                            });
                                        })
                                        .catch()
                                }
                                resolve(true)
                            })
                            .catch(err => {
                                resolve(true)
                            })
                    })
                }
            })
            .catch(err => {
                reject(false)
            })
    })
}

const handleRekursif = async() => {
    handleAction()
        .then(result => {
            if (result) {
                setTimeout(handleRekursif(), 600000)
            }
        })
        .catch(err => {

        })
}

module.exports = handleRekursif