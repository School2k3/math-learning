import prisma from '../prisma/prisma.js';
const rewardController = {
    // Get all available rewards (avatars)
    getAllRewards: async (req, res) => {
        try {
            const { type } = req.query;
            const whereClause = {
                isActive: true,
            };
            if (type) {
                whereClause.type = type;
            }
            const rewards = await prisma.reward.findMany({
                where: whereClause,
                orderBy: [
                    { cost: 'asc' },
                    { createdAt: 'desc' },
                ],
            });
            res.status(200).json({ rewards });
        }
        catch (error) {
            console.error('Error getting rewards:', error);
            res.status(500).json({ message: 'Error getting rewards', error: error.message });
        }
    },
    // Get a specific reward by ID
    getRewardById: async (req, res) => {
        try {
            const { id } = req.params;
            const reward = await prisma.reward.findUnique({
                where: { id: parseInt(id) },
            });
            if (!reward) {
                res.status(404).json({ message: 'Reward not found' });
                return;
            }
            res.status(200).json({ reward });
        }
        catch (error) {
            console.error('Error getting reward:', error);
            res.status(500).json({ message: 'Error getting reward', error: error.message });
        }
    },
    // Get user's rewards (avatars they own)
    getUserRewards: async (req, res) => {
        try {
            const { userId } = req.params;
            const { type } = req.query;
            const whereClause = {
                userId: parseInt(userId),
            };
            // Filter by reward type if specified
            if (type) {
                whereClause.reward = {
                    type: type,
                };
            }
            const userRewards = await prisma.userReward.findMany({
                where: whereClause,
                include: {
                    reward: true,
                },
                orderBy: {
                    acquiredAt: 'desc',
                },
            });
            res.status(200).json({ userRewards });
        }
        catch (error) {
            console.error('Error getting user rewards:', error);
            res.status(500).json({ message: 'Error getting user rewards', error: error.message });
        }
    },
    // Exchange trophies for a reward (avatar)
    exchangeReward: async (req, res) => {
        try {
            const { userId, rewardId } = req.body;
            if (!userId || !rewardId) {
                res.status(400).json({ message: 'User ID and Reward ID are required' });
                return;
            }
            // Get user's current trophies
            const user = await prisma.user.findUnique({
                where: { id: parseInt(userId) },
            });
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            // Get reward details
            const reward = await prisma.reward.findUnique({
                where: { id: parseInt(rewardId) },
            });
            if (!reward) {
                res.status(404).json({ message: 'Reward not found' });
                return;
            }
            if (!reward.isActive) {
                res.status(400).json({ message: 'This reward is no longer available' });
                return;
            }
            // Check if user already owns this reward
            const existingReward = await prisma.userReward.findFirst({
                where: {
                    userId: parseInt(userId),
                    rewardId: parseInt(rewardId),
                },
            });
            if (existingReward) {
                res.status(400).json({ message: 'You already own this reward' });
                return;
            }
            // Check if user has enough trophies
            if (user.trophies < reward.cost) {
                res.status(400).json({
                    message: 'Not enough trophies',
                    required: reward.cost,
                    current: user.trophies,
                    needed: reward.cost - user.trophies,
                });
                return;
            }
            // Perform the exchange in a transaction
            const result = await prisma.$transaction(async (tx) => {
                // Deduct trophies from user
                const updatedUser = await tx.user.update({
                    where: { id: parseInt(userId) },
                    data: {
                        trophies: {
                            decrement: reward.cost,
                        },
                    },
                });
                // Add reward to user's collection
                const userReward = await tx.userReward.create({
                    data: {
                        userId: parseInt(userId),
                        rewardId: parseInt(rewardId),
                    },
                    include: {
                        reward: true,
                    },
                });
                return { updatedUser, userReward };
            });
            res.status(201).json({
                message: 'Reward exchanged successfully',
                userReward: result.userReward,
                remainingTrophies: result.updatedUser.trophies,
            });
        }
        catch (error) {
            console.error('Error exchanging reward:', error);
            res.status(500).json({ message: 'Error exchanging reward', error: error.message });
        }
    },
    // Equip an avatar (set as current avatar)
    equipAvatar: async (req, res) => {
        try {
            const { userId, userRewardId } = req.body;
            if (!userId || !userRewardId) {
                res.status(400).json({ message: 'User ID and User Reward ID are required' });
                return;
            }
            // Check if the user owns this reward
            const userReward = await prisma.userReward.findUnique({
                where: { id: parseInt(userRewardId) },
                include: {
                    reward: true,
                },
            });
            if (!userReward) {
                res.status(404).json({ message: 'User reward not found' });
                return;
            }
            if (userReward.userId !== parseInt(userId)) {
                res.status(403).json({ message: 'This reward does not belong to you' });
                return;
            }
            if (userReward.reward.type !== 'avatar') {
                res.status(400).json({ message: 'Only avatars can be equipped' });
                return;
            }
            // Unequip all other avatars and equip this one
            await prisma.$transaction(async (tx) => {
                // Unequip all avatars for this user
                await tx.userReward.updateMany({
                    where: {
                        userId: parseInt(userId),
                        reward: {
                            type: 'avatar',
                        },
                    },
                    data: {
                        isEquipped: false,
                    },
                });
                // Equip the selected avatar
                await tx.userReward.update({
                    where: { id: parseInt(userRewardId) },
                    data: {
                        isEquipped: true,
                    },
                });
                // Update user's avatarUrl
                await tx.user.update({
                    where: { id: parseInt(userId) },
                    data: {
                        avatarUrl: userReward.reward.imageUrl,
                    },
                });
            });
            res.status(200).json({
                message: 'Avatar equipped successfully',
                avatarUrl: userReward.reward.imageUrl,
            });
        }
        catch (error) {
            console.error('Error equipping avatar:', error);
            res.status(500).json({ message: 'Error equipping avatar', error: error.message });
        }
    },
    // Create a new reward (admin only)
    createReward: async (req, res) => {
        try {
            const { name, cost, type, imageUrl, description } = req.body;
            if (!name || !cost || !type) {
                res.status(400).json({ message: 'Name, cost, and type are required' });
                return;
            }
            const reward = await prisma.reward.create({
                data: {
                    name,
                    cost: parseInt(cost),
                    type,
                    imageUrl,
                    description,
                },
            });
            res.status(201).json({
                message: 'Reward created successfully',
                reward,
            });
        }
        catch (error) {
            console.error('Error creating reward:', error);
            res.status(500).json({ message: 'Error creating reward', error: error.message });
        }
    },
    // Update a reward (admin only)
    updateReward: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, cost, type, imageUrl, description, isActive } = req.body;
            const reward = await prisma.reward.findUnique({
                where: { id: parseInt(id) },
            });
            if (!reward) {
                res.status(404).json({ message: 'Reward not found' });
                return;
            }
            const updatedReward = await prisma.reward.update({
                where: { id: parseInt(id) },
                data: {
                    name: name || reward.name,
                    cost: cost !== undefined ? parseInt(cost) : reward.cost,
                    type: type || reward.type,
                    imageUrl: imageUrl !== undefined ? imageUrl : reward.imageUrl,
                    description: description !== undefined ? description : reward.description,
                    isActive: isActive !== undefined ? isActive : reward.isActive,
                },
            });
            res.status(200).json({
                message: 'Reward updated successfully',
                reward: updatedReward,
            });
        }
        catch (error) {
            console.error('Error updating reward:', error);
            res.status(500).json({ message: 'Error updating reward', error: error.message });
        }
    },
    // Delete a reward (admin only)
    deleteReward: async (req, res) => {
        try {
            const { id } = req.params;
            const reward = await prisma.reward.findUnique({
                where: { id: parseInt(id) },
            });
            if (!reward) {
                res.status(404).json({ message: 'Reward not found' });
                return;
            }
            // Check if any users own this reward
            const userRewardsCount = await prisma.userReward.count({
                where: { rewardId: parseInt(id) },
            });
            if (userRewardsCount > 0) {
                res.status(400).json({
                    message: 'Cannot delete reward that users have acquired. Consider deactivating it instead.',
                });
                return;
            }
            await prisma.reward.delete({
                where: { id: parseInt(id) },
            });
            res.status(200).json({ message: 'Reward deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting reward:', error);
            res.status(500).json({ message: 'Error deleting reward', error: error.message });
        }
    },
};
export default rewardController;
