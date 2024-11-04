const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const foldersController = require('../controllers/folders');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Folder routes
router.post('/folders', isAuthenticated, foldersController.createFolder);
router.get('/folders/:id', isAuthenticated, foldersController.getFolder);
router.post('/folders/:id/delete', isAuthenticated, foldersController.deleteFolder);

// File upload within folder
router.post('/folders/:id/upload', isAuthenticated, upload.single('file'), async (req, res) => {
    // This will be handled by your existing file controller with folder support
    // You'll need to update your file upload logic to include folderId
});

module.exports = router;
