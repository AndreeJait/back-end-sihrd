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

router.post("/add", upload.single('profile'), dosensController.add_new_dosen_data_diri)
router.get("/all", dosensController.get_all_dosen)
router.get('/count', dosensController.get_count_dosen)
router.get('/:idDosen', dosensController.get_dosen_by_id)
router.post("/search/hrd", dosensController.get_all_dosen)
router.post("/search", dosensController.search_dosen_by_nip_name)
router.post("/addkeluarga/:idDosen", dosensController.add_data_keluarga)
router.post("/addpendidikan/:idDosen", dosensController.add_data_pendidikan_dosen)
router.post("/addjabatan/:idDosen", dosensController.add_data_jabatan)
router.post("/addpemangkatan/:idDosen", dosensController.add_data_pemangkatan)
router.post("/addsertifikasi/:idDosen", dosensController.add_data_sertifikasi)
router.post("/delete/:idDosen", dosensController.delete_data_dosen)
router.get("/jabatan/active", dosensController.get_jabatan_active)
router.get("/jabatan/willend", dosensController.jabatan_akan_berakhir)
router.get("/pangkat/willend", dosensController.pemangkatan_yang_akan_terjadi)
router.get("/pendidikan/active", dosensController.get_dosen_in_study)
module.exports = router