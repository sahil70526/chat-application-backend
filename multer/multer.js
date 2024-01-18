import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/profileImage/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    },
});
let maxSize = 50 * 1000000;
const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/media/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    },
    onFileUploadStart: function (file, req, res) {
        if (file.length > maxSize) {
            return false;
        }
    }
});

export const uploadProfilepic = multer({
    storage: storage
});

export const uploadMedia = multer({
    storage: storage2
});