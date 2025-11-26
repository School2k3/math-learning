import { Router } from 'express';
import multer from 'multer';
import { uploadImage, uploadVideo, uploadAudio } from '../controllers/uploadController.js';
const router = Router();
// Use memory storage; we'll stream to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });
/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload an image to Cloudinary
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Upload failed
 */
router.post('/image', upload.single('image'), uploadImage);
/**
 * @swagger
 * /api/upload/video:
 *   post:
 *     summary: Upload a video to Cloudinary
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Upload failed
 */
router.post('/video', upload.single('video'), uploadVideo);
/**
 * @swagger
 * /api/upload/audio:
 *   post:
 *     summary: Upload an audio file to Cloudinary
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Audio uploaded successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Upload failed
 */
router.post('/audio', upload.single('audio'), uploadAudio);
export default router;
