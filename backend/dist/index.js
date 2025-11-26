import './config/env.js';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';
// Import routes
import chapterRoutes from './routes/chapterRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import answerRoutes from './routes/answerRoutes.js';
import examRoutes from './routes/examRoutes.js';
import authRoutes from './routes/authRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import lessonReviewRoutes from './routes/lessonReviewRoutes.js';
import userStatsRoutes from './routes/userStatsRoutes.js';
import adminStatsRoutes from './routes/adminStatsRoutes.js';
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
// API Routes
app.get('/', (_req, res) => {
    res.send('Math Learning API is running!');
});
app.use('/api/auth', authRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/lesson-reviews', lessonReviewRoutes);
app.use('/api/user-stats', userStatsRoutes);
app.use('/api/admin-stats', adminStatsRoutes);
// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Math Learning API Documentation"
}));
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});
// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing HTTP server');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT signal received. Closing HTTP server');
    process.exit(0);
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});
console.log('GEMINI key prefix:', process.env.GEMINI_API_KEY?.slice(0, 4));
console.log('CLOUDINARY key prefix:', process.env.CLOUDINARY_API_KEY?.slice(0, 4));
console.log('CLOUDINARY secret prefix:', process.env.CLOUDINARY_API_SECRET?.slice(0, 4));
console.log('CLOUDINARY cloud name prefix:', process.env.CLOUDINARY_CLOUD_NAME?.slice(0, 4));
export default app;
