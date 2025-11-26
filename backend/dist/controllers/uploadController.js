import cloudinary from '../utils/cloudinary.js';
import stream from 'stream';
export const uploadImage = async (req, res, _next) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Upload buffer to Cloudinary using upload_stream
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: 'math-learning', resource_type: 'image' }, (error, uploadResult) => {
                if (error)
                    return reject(error);
                if (!uploadResult)
                    return reject(new Error('Empty Cloudinary response'));
                return resolve({ secure_url: uploadResult.secure_url });
            });
            const bufferStream = new stream.PassThrough();
            bufferStream.end(file.buffer);
            bufferStream.pipe(uploadStream);
        });
        return res.status(201).json({ url: result.secure_url });
    }
    catch (err) {
        console.error('Cloudinary upload failed:', err);
        return res.status(500).json({ message: 'Image upload failed' });
    }
};
export const uploadVideo = async (req, res, _next) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: 'math-learning', resource_type: 'video' }, (error, uploadResult) => {
                if (error)
                    return reject(error);
                if (!uploadResult)
                    return reject(new Error('Empty Cloudinary response'));
                return resolve({ secure_url: uploadResult.secure_url });
            });
            const bufferStream = new stream.PassThrough();
            bufferStream.end(file.buffer);
            bufferStream.pipe(uploadStream);
        });
        return res.status(201).json({ url: result.secure_url });
    }
    catch (err) {
        console.error('Cloudinary video upload failed:', err);
        return res.status(500).json({ message: 'Video upload failed' });
    }
};
export const uploadAudio = async (req, res, _next) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Cloudinary treats audio under resource_type 'video' (or 'auto')
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: 'math-learning', resource_type: 'video' }, (error, uploadResult) => {
                if (error)
                    return reject(error);
                if (!uploadResult)
                    return reject(new Error('Empty Cloudinary response'));
                return resolve({ secure_url: uploadResult.secure_url });
            });
            const bufferStream = new stream.PassThrough();
            bufferStream.end(file.buffer);
            bufferStream.pipe(uploadStream);
        });
        return res.status(201).json({ url: result.secure_url });
    }
    catch (err) {
        console.error('Cloudinary audio upload failed:', err);
        return res.status(500).json({ message: 'Audio upload failed' });
    }
};
