const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const supabase = require('../config/supabase');

// Upload a file
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.redirect('/dashboard?error=No file uploaded');
        }

        const folderId = req.params.folderId || null;
        const customFileName = req.body.customFileName;
        const originalName = customFileName || req.file.originalname;
        
        // Create a unique stored filename
        const timestamp = Date.now();
        const storedFilename = `${timestamp}_${req.file.originalname}`;

        // Upload to Supabase Storage with user ID prefix in path
        const { data, error } = await supabase.storage
            .from('files')
            .upload(
                `${req.user.id}/${storedFilename}`,
                req.file.buffer,
                {
                    contentType: req.file.mimetype,
                    cacheControl: '3600',
                    upsert: false
                }
            );

        if (error) throw error;

        // Save file information to database - store only the filename part
        const file = await prisma.file.create({
            data: {
                name: originalName,
                storedName: storedFilename,
                userId: req.user.id,
                folderId: folderId,
                size: req.file.size,
                mimeType: req.file.mimetype,
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

        // Get file from Supabase Storage with user ID prefix
        const { data, error } = await supabase.storage
            .from('files')
            .download(`${file.userId}/${file.storedName}`);

        if (error) throw error;

        // Set response headers
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
        
        // Send the file data
        const buffer = Buffer.from(await data.arrayBuffer());
        res.send(buffer);
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

        // Delete from Supabase Storage
        const { error } = await supabase.storage
            .from('files')
            .remove([`${req.user.id}/${file.storedName}`]);

        if (error) throw error;

        // Delete file record from database
        await prisma.file.delete({
            where: { id: req.params.id }
        });

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
