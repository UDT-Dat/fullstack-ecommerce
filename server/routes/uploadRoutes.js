const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/authMiddleware');

// Tự tạo folder nếu chưa tồn tại
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `image-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const checkFileType = (file, cb) => {
    const allowedExt = /\.(jpg|jpeg|png|webp|gif|avif)$/i;
    const isValidExt = allowedExt.test(file.originalname);
    const isValidMime = file.mimetype.startsWith('image/');

    if (isValidExt && isValidMime) {
        return cb(null, true);
    }
    cb(new Error('Images only! (jpg, jpeg, png, webp, gif, avif)'));
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', auth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }
    // Trả về URL đường dẫn public
    res.status(200).json({
        message: 'Image Uploaded Successful',
        url: `http://localhost:5000/uploads/${req.file.filename}`,
    });
});

module.exports = router;
