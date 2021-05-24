const express = require('express')
const router = express.Router()
const multer = require('multer')
const checkAuth = require('../middleware/check-auth')
const checkRefreshToken = require('../middleware/check-refresh-token')
const usersController = require('../controllers/users')
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/hrd/')
    },
    filename: function(req, file, cb) {
        var today = new Date()
        var x = today.getTime().toString()
        cb(null, x + "-HRD_PROFILE." + file.originalname.split(".")[1])
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
router.put('/add', checkAuth, upload.single('hrd_profile'), usersController.add_new_hrd)
router.get('/all', checkAuth, usersController.get_all_hrd)
router.get('/refreshToken', checkRefreshToken, usersController.refresh_token)
router.delete('/:hrdId', checkAuth, usersController.delete_hrd_by_id)
router.get('/:hrdId', checkAuth, usersController.get_hrd_by_id)
router.post('/login', usersController.login_hrd)
router.put('/update', checkAuth, usersController.update_users_by_email)
router.put('/update/profile', upload.single('user_profile'), usersController.update_profile_by_email)
module.exports = router