const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/check-auth')
const multer = require('multer')
const dosensController = require('../controllers/dosens')
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/dosen/')
    },
    filename: function(req, file, cb) {
        var today = new Date()
        var x = today.getTime().toString()
        cb(null, x + "-DOSEN_PROFILE." + file.originalname.split(".")[1])
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})

router.post("/add", upload.single('dosen_profile'), dosensController.add_new_dosen_data_diri)
router.get("/all", dosensController.get_all_dosen)
router.post("/search", dosensController.search_dosen_by_nip_name)
router.post("/addpendidikan/:idDosen", dosensController.add_data_pendidikan_dosen)
router.post("/addkeluarga/:idDosen", dosensController.add_data_keluarga)
router.post("/addjabatan/:idDosen", dosensController.add_data_jabatan)
router.post("/addpemangkatan/:idDosen", dosensController.add_data_pemangkatan)
router.get("/jabatan/active", dosensController.get_jabatan_active)
router.get("/pendidikan/active", dosensController.get_dosen_in_study)
module.exports = router