import express from 'express';
import rewardController from '../controllers/rewardController.js';
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Rewards
 *   description: Reward and avatar management
 */
/**
 * @swagger
 * /api/rewards:
 *   get:
 *     summary: Get all available rewards
 *     tags: [Rewards]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [avatar, badge, item, decoration]
 *         description: Filter by reward type
 *     responses:
 *       200:
 *         description: List of rewards retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', rewardController.getAllRewards);
/**
 * @swagger
 * /api/rewards/{id}:
 *   get:
 *     summary: Get a specific reward by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reward ID
 *     responses:
 *       200:
 *         description: Reward retrieved successfully
 *       404:
 *         description: Reward not found
 *       500:
 *         description: Server error
 */
router.get('/:id', rewardController.getRewardById);
/**
 * @swagger
 * /api/rewards/user/{userId}:
 *   get:
 *     summary: Get user's rewards (owned avatars/items)
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [avatar, badge, item, decoration]
 *         description: Filter by reward type
 *     responses:
 *       200:
 *         description: User rewards retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', rewardController.getUserRewards);
/**
 * @swagger
 * /api/rewards/exchange:
 *   post:
 *     summary: Exchange trophies for a reward
 *     tags: [Rewards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - rewardId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               rewardId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Reward exchanged successfully
 *       400:
 *         description: Bad request - Not enough trophies or already owned
 *       404:
 *         description: User or reward not found
 *       500:
 *         description: Server error
 */
router.post('/exchange', rewardController.exchangeReward);
/**
 * @swagger
 * /api/rewards/equip:
 *   post:
 *     summary: Equip an avatar (set as current avatar)
 *     tags: [Rewards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - userRewardId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               userRewardId:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Avatar equipped successfully
 *       400:
 *         description: Bad request - Only avatars can be equipped
 *       403:
 *         description: Forbidden - Reward doesn't belong to user
 *       404:
 *         description: User reward not found
 *       500:
 *         description: Server error
 */
router.post('/equip', rewardController.equipAvatar);
/**
 * @swagger
 * /api/rewards:
 *   post:
 *     summary: Create a new reward (admin only)
 *     tags: [Rewards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - cost
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cool Avatar
 *               cost:
 *                 type: integer
 *                 example: 10
 *               type:
 *                 type: string
 *                 enum: [avatar, badge, item, decoration]
 *                 example: avatar
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/avatar.png
 *               description:
 *                 type: string
 *                 example: A cool avatar for students
 *     responses:
 *       201:
 *         description: Reward created successfully
 *       400:
 *         description: Bad request - Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/', rewardController.createReward);
/**
 * @swagger
 * /api/rewards/{id}:
 *   put:
 *     summary: Update a reward (admin only)
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reward ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cost:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [avatar, badge, item, decoration]
 *               imageUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Reward updated successfully
 *       404:
 *         description: Reward not found
 *       500:
 *         description: Server error
 */
router.put('/:id', rewardController.updateReward);
/**
 * @swagger
 * /api/rewards/{id}:
 *   delete:
 *     summary: Delete a reward (admin only)
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reward ID
 *     responses:
 *       200:
 *         description: Reward deleted successfully
 *       400:
 *         description: Cannot delete reward that users have acquired
 *       404:
 *         description: Reward not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', rewardController.deleteReward);
export default router;
