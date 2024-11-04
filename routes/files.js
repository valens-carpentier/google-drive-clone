const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuthenticated } = require('../middleware/auth');
const filesController = require('../controllers/files');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const customFileName = req.body.customFileName;
        
        if (customFileName) {
            // Use custom filename with original extension
            const fileExt = path.extname(file.originalname);
            cb(null, `${customFileName}${fileExt}`);
        } else {
            // Use original filename with unique suffix
            cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
        }
    }
});

const upload = multer({ storage: storage });

// File routes
router.post('/upload', isAuthenticated, upload.single('file'), filesController.uploadFile);
router.post('/folders/:folderId/upload', isAuthenticated, upload.single('file'), filesController.uploadFile);
router.get('/files/:id/download', isAuthenticated, filesController.downloadFile);
router.post('/files/:id/delete', isAuthenticated, filesController.deleteFile);
router.get('/files/:id', isAuthenticated, filesController.getFile);
router.post('/files/:id/move', isAuthenticated, filesController.moveFile);

module.exports = router;