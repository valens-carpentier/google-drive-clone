const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

// Upload a file
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.redirect('/dashboard?error=No file uploaded');
        }

        const folderId = req.params.folderId || null;
        const customFileName = req.body.customFileName;
        
        // Save file information to database with both names
        const file = await prisma.file.create({
            data: {
                name: customFileName || req.file.originalname,
                storedName: req.file.filename, // Store the actual filename on disk
                userId: req.user.id,
                folderId: folderId,
                size: req.file.size,
                uploadedAt: new Date()
            }
        });

        if (folderId) {
            res.redirect(`/folders/${folderId}`);
        } else {
            res.redirect('/dashboard');
        }
    } catch (error) {
        console.error(error);
        const redirectUrl = req.params.folderId 
            ? `/folders/${req.params.folderId}?error=File upload failed`
            : '/dashboard?error=File upload failed';
        res.redirect(redirectUrl);
    }
};

// Download a file
const downloadFile = async (req, res) => {
    try {
        const file = await prisma.file.findUnique({
            where: { id: req.params.id }
        });

        if (!file || file.userId !== req.user.id) {
            return res.redirect('/dashboard?error=File not found');
        }

        const filePath = path.join(__dirname, '../uploads', file.storedName);
        
        if (!fs.existsSync(filePath)) {
            return res.redirect('/dashboard?error=File not found on disk');
        }

        res.download(filePath, file.name);
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?error=Download failed');
    }
};

// Delete a file
const deleteFile = async (req, res) => {
    try {
        const file = await prisma.file.findUnique({
            where: { id: req.params.id },
            include: { folder: true }
        });

        if (!file || file.userId !== req.user.id) {
            return res.redirect('/dashboard?error=File not found');
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../uploads/', file.name);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete file record from database
        await prisma.file.delete({
            where: { id: req.params.id }
        });

        // Redirect based on whether file was in a folder or not
        if (file.folderId) {
            res.redirect(`/folders/${file.folderId}`);
        } else {
            res.redirect('/dashboard');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?error=Delete failed');
    }
};

// Get file details
const getFile = async (req, res) => {
    try {
        const [file, folders] = await Promise.all([
            prisma.file.findUnique({
                where: { id: req.params.id },
                include: { folder: true }
            }),
            prisma.folder.findMany({
                where: { userId: req.user.id }
            })
        ]);

        if (!file || file.userId !== req.user.id) {
            return res.redirect('/dashboard?error=File not found');
        }

        res.render('file', { file, folders, user: req.user });
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?error=Failed to get file details');
    }
};

// Move a file
const moveFile = async (req, res) => {
    try {
        const file = await prisma.file.findUnique({
            where: { id: req.params.id }
        });

        if (!file || file.userId !== req.user.id) {
            return res.redirect('/dashboard?error=File not found');
        }

        const { folderId } = req.body;
        
        // If folderId is empty string, move to root
        const updateData = {
            folderId: folderId || null
        };

        await prisma.file.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.redirect(`/files/${req.params.id}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/files/${req.params.id}?error=Failed to move file`);
    }
};

module.exports = {
    uploadFile,
    downloadFile,
    deleteFile,
    getFile,
    moveFile
};
