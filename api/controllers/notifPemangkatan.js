const mongoose = require("mongoose")
const dataPemangkatan = require("../models/dataPemangkatan")
const notifications = require("../models/notifications")

const handleAction = () => {
    return new Promise((resolve, reject) => {
        let today = new Date()
        let start = new Date(today.getTime() - (4 * 365 * 60 * 24 * 60 * 1000) - (4 * 60 * 60 * 24 * 1000))
        let limit = new Date(today.getTime() - (4 * 365 * 60 * 24 * 60 * 1000) + (4 * 60 * 60 * 24 * 1000))
        dataPemangkatan.find({ 'tanggal_kenaikan': { $gte: start, $lte: limit } })
            .populate("dosen")
            .exec()
            .then(result => {
                if (result.length) {
                    result.map((item, index) => {
                        let strDate = new Date(item.tanggal_kenaikan)
                        let content = "Dosen dengan nama " + item.dosen.nama_lengkap + " Dengan NIP " + item.dosen.nip + " sekarang memasuki 4 tahun semenjak kenaikan pangkat " + item.nama + " Pada tanggal " + strDate.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", month: "long", year: "numeric", day: "numeric" }) + " !"
                        notifications.find({ content: content })
                            .exec()
                            .then(result => {
                                if (!result.length) {
                                    let new_notif = new notifications({
                                        _id: mongoose.Types.ObjectId(),
                                        content: content,
                                        tanggal_notif: new Date(),
                                    })
                                    new_notif.save()
                                        .then(result => {
                                            console.log("Notif dibuat")
                                        })
                                        .catch()
                                }
                            })
                            .catch()
                    })
                }
                resolve(true)
            })
            .catch(err => {
                console.log("error")
                reject(false)
            })
    })
}

const handleRekursif = async() => {
    handleAction()
        .then(result => {
            if (result) {
                handleRekursif()
            }
        })
        .catch(err => {

        })
}

module.exports = handleRekursif