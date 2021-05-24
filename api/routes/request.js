const express = require('express')
const router = express.Router()
const requestController = require('../controllers/request')
const checkAuth = require('../middleware/check-auth')

router.post("/request", requestController.request_data_dosen)
router.post("/confirm", requestController.confirm_data_dosen)
router.post("/take", requestController.take_data_dosen)
router.get("/notif/:offset", requestController.get_all_notif)
router.post("/notif/read", requestController.doing_read_notif)
module.exports = router