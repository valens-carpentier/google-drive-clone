const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createFolder = async (req, res) => {
    try {
        const { name } = req.body;
        const folder = await prisma.folder.create({
            data: {
                name,
                userId: req.user.id
            }
        });
        res.redirect(`/folders/${folder.id}`);
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?error=Failed to create folder');
    }
};

const getFolder = async (req, res) => {
    try {
        const folder = await prisma.folder.findUnique({
            where: { id: req.params.id },
            include: { files: true }
        });

        if (!folder || folder.userId !== req.user.id) {
            return res.redirect('/dashboard?error=Folder not found');
        }

        res.render('folder', { folder, files: folder.files });
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?error=Failed to load folder');
    }
};

const deleteFolder = async (req, res) => {
    try {
        const folder = await prisma.folder.findUnique({
            where: { id: req.params.id }
        });

        if (!folder || folder.userId !== req.user.id) {
            return res.redirect('/dashboard?error=Folder not found');
        }

        await prisma.folder.delete({
            where: { id: req.params.id }
        });

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard?error=Failed to delete folder');
    }
};

module.exports = {
    createFolder,
    getFolder,
    deleteFolder
};
