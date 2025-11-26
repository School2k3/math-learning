import prisma from '../prisma/prisma.js';
const lessonReviewController = {
    // Like a lesson
    likeLesson: async (req, res) => {
        try {
            const { userId, lessonId } = req.body;
            if (!userId || !lessonId) {
                res.status(400).json({ message: 'User ID and Lesson ID are required' });
                return;
            }
            // Check if lesson exists
            const lesson = await prisma.lesson.findUnique({
                where: { id: parseInt(lessonId) },
            });
            if (!lesson) {
                res.status(404).json({ message: 'Lesson not found' });
                return;
            }
            // Check if user already liked this lesson
            const existingLike = await prisma.lessonLike.findUnique({
                where: {
                    userId_lessonId: {
                        userId: parseInt(userId),
                        lessonId: parseInt(lessonId),
                    },
                },
            });
            if (existingLike) {
                res.status(400).json({ message: 'You have already liked this lesson' });
                return;
            }
            // Create like
            const like = await prisma.lessonLike.create({
                data: {
                    userId: parseInt(userId),
                    lessonId: parseInt(lessonId),
                },
            });
            // Get updated like count
            const totalLikes = await prisma.lessonLike.count({
                where: { lessonId: parseInt(lessonId) },
            });
            res.status(201).json({
                message: 'Lesson liked successfully',
                like,
                totalLikes,
            });
        }
        catch (error) {
            console.error('Error liking lesson:', error);
            res.status(500).json({ message: 'Error liking lesson', error: error.message });
        }
    },
    // Unlike a lesson
    unlikeLesson: async (req, res) => {
        try {
            const { userId, lessonId } = req.body;
            if (!userId || !lessonId) {
                res.status(400).json({ message: 'User ID and Lesson ID are required' });
                return;
            }
            // Check if like exists
            const existingLike = await prisma.lessonLike.findUnique({
                where: {
                    userId_lessonId: {
                        userId: parseInt(userId),
                        lessonId: parseInt(lessonId),
                    },
                },
            });
            if (!existingLike) {
                res.status(404).json({ message: 'Like not found' });
                return;
            }
            // Delete like
            await prisma.lessonLike.delete({
                where: {
                    userId_lessonId: {
                        userId: parseInt(userId),
                        lessonId: parseInt(lessonId),
                    },
                },
            });
            // Get updated like count
            const totalLikes = await prisma.lessonLike.count({
                where: { lessonId: parseInt(lessonId) },
            });
            res.status(200).json({
                message: 'Lesson unliked successfully',
                totalLikes,
            });
        }
        catch (error) {
            console.error('Error unliking lesson:', error);
            res.status(500).json({ message: 'Error unliking lesson', error: error.message });
        }
    },
    // Get lesson likes count and users who liked
    getLessonLikes: async (req, res) => {
        try {
            const { lessonId } = req.params;
            const likes = await prisma.lessonLike.findMany({
                where: { lessonId: parseInt(lessonId) },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            res.status(200).json({
                totalLikes: likes.length,
                likes,
            });
        }
        catch (error) {
            console.error('Error getting lesson likes:', error);
            res.status(500).json({ message: 'Error getting lesson likes', error: error.message });
        }
    },
    // Create or update a review
    createOrUpdateReview: async (req, res) => {
        try {
            const { userId, lessonId, rating, comment } = req.body;
            if (!userId || !lessonId || !rating) {
                res.status(400).json({ message: 'User ID, Lesson ID, and Rating are required' });
                return;
            }
            // Validate rating (1-5)
            if (rating < 1 || rating > 5) {
                res.status(400).json({ message: 'Rating must be between 1 and 5' });
                return;
            }
            // Check if lesson exists
            const lesson = await prisma.lesson.findUnique({
                where: { id: parseInt(lessonId) },
            });
            if (!lesson) {
                res.status(404).json({ message: 'Lesson not found' });
                return;
            }
            // Check if user already reviewed this lesson
            const existingReview = await prisma.lessonReview.findUnique({
                where: {
                    userId_lessonId: {
                        userId: parseInt(userId),
                        lessonId: parseInt(lessonId),
                    },
                },
            });
            let review;
            let isUpdate = false;
            if (existingReview) {
                // Update existing review
                review = await prisma.lessonReview.update({
                    where: {
                        userId_lessonId: {
                            userId: parseInt(userId),
                            lessonId: parseInt(lessonId),
                        },
                    },
                    data: {
                        rating: parseInt(rating),
                        comment: comment || null,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                });
                isUpdate = true;
            }
            else {
                // Create new review
                review = await prisma.lessonReview.create({
                    data: {
                        userId: parseInt(userId),
                        lessonId: parseInt(lessonId),
                        rating: parseInt(rating),
                        comment: comment || null,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                });
            }
            // Calculate new average rating
            const allReviews = await prisma.lessonReview.findMany({
                where: { lessonId: parseInt(lessonId) },
            });
            const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            res.status(isUpdate ? 200 : 201).json({
                message: isUpdate ? 'Review updated successfully' : 'Review created successfully',
                review,
                statistics: {
                    totalReviews: allReviews.length,
                    averageRating: Math.round(averageRating * 10) / 10,
                },
            });
        }
        catch (error) {
            console.error('Error creating/updating review:', error);
            res.status(500).json({ message: 'Error creating/updating review', error: error.message });
        }
    },
    // Delete a review
    deleteReview: async (req, res) => {
        try {
            const { userId, lessonId } = req.body;
            if (!userId || !lessonId) {
                res.status(400).json({ message: 'User ID and Lesson ID are required' });
                return;
            }
            // Check if review exists
            const existingReview = await prisma.lessonReview.findUnique({
                where: {
                    userId_lessonId: {
                        userId: parseInt(userId),
                        lessonId: parseInt(lessonId),
                    },
                },
            });
            if (!existingReview) {
                res.status(404).json({ message: 'Review not found' });
                return;
            }
            // Delete review
            await prisma.lessonReview.delete({
                where: {
                    userId_lessonId: {
                        userId: parseInt(userId),
                        lessonId: parseInt(lessonId),
                    },
                },
            });
            // Calculate new average rating
            const allReviews = await prisma.lessonReview.findMany({
                where: { lessonId: parseInt(lessonId) },
            });
            const averageRating = allReviews.length > 0
                ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
                : 0;
            res.status(200).json({
                message: 'Review deleted successfully',
                statistics: {
                    totalReviews: allReviews.length,
                    averageRating: Math.round(averageRating * 10) / 10,
                },
            });
        }
        catch (error) {
            console.error('Error deleting review:', error);
            res.status(500).json({ message: 'Error deleting review', error: error.message });
        }
    },
    // Get all reviews for a lesson
    getLessonReviews: async (req, res) => {
        try {
            const { lessonId } = req.params;
            const { rating } = req.query; // Optional filter by rating
            const whereClause = {
                lessonId: parseInt(lessonId),
            };
            if (rating) {
                whereClause.rating = parseInt(rating);
            }
            const reviews = await prisma.lessonReview.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            // Calculate statistics
            const totalReviews = reviews.length;
            const averageRating = totalReviews > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                : 0;
            // Count by rating
            const ratingDistribution = {
                5: reviews.filter(r => r.rating === 5).length,
                4: reviews.filter(r => r.rating === 4).length,
                3: reviews.filter(r => r.rating === 3).length,
                2: reviews.filter(r => r.rating === 2).length,
                1: reviews.filter(r => r.rating === 1).length,
            };
            res.status(200).json({
                reviews,
                statistics: {
                    totalReviews,
                    averageRating: Math.round(averageRating * 10) / 10,
                    ratingDistribution,
                },
            });
        }
        catch (error) {
            console.error('Error getting lesson reviews:', error);
            res.status(500).json({ message: 'Error getting lesson reviews', error: error.message });
        }
    },
    // Get a specific user's review for a lesson
    getUserReview: async (req, res) => {
        try {
            const { lessonId, userId } = req.params;
            const review = await prisma.lessonReview.findUnique({
                where: {
                    userId_lessonId: {
                        userId: parseInt(userId),
                        lessonId: parseInt(lessonId),
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            if (!review) {
                res.status(404).json({ message: 'Review not found' });
                return;
            }
            res.status(200).json({ review });
        }
        catch (error) {
            console.error('Error getting user review:', error);
            res.status(500).json({ message: 'Error getting user review', error: error.message });
        }
    },
};
export default lessonReviewController;
