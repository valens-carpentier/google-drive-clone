const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const filesController = require('../controllers/files');
const upload = require('../config/multer');

router.post('/upload', isAuthenticated, upload.single('file'), filesController.uploadFile);
router.post('/folders/:folderId/upload', isAuthenticated, upload.single('file'), filesController.uploadFile);
router.get('/files/:id/download', isAuthenticated, filesController.downloadFile);
router.post('/files/:id/delete', isAuthenticated, filesController.deleteFile);
router.get('/files/:id', isAuthenticated, filesController.getFile);
router.post('/files/:id/move', isAuthenticated, filesController.moveFile);

module.exports = router;