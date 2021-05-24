const mongoose = require('mongoose')
const notifacationsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    content: { type: String, require: true },
    tanggal_notif: { type: Date, require: true },
    isRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "users", default: [] }],
})
module.exports = mongoose.model("notifications", notifacationsSchema)