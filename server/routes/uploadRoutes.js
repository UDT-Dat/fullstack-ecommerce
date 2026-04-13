const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/authMiddleware');

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình lưu trữ ảnh lên Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'my-project-assets', // Tên thư mục sẽ tạo trên Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
    },
});

const checkFileType = (file, cb) => {
    const isValidMime = file.mimetype.startsWith('image/');
    if (isValidMime) {
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
    // Trả về URL đường dẫn từ Cloudinary
    res.status(200).json({
        message: 'Image Uploaded Successful',
        url: req.file.path,
    });
});

module.exports = router;
