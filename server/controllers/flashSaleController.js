// controllers/flashSaleController.js
import Redis from 'ioredis';
const redis = new Redis(); // Default localhost:6379

export const joinWaitroom = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id; // Auth middleware se milega

        // 1. Check if product exists and is a Flash Sale
        // (Ye MongoDB se check hoga, ya optimization ke liye Redis se bhi kar sakte ho)

        // 2. Add to Redis Queue (Waitroom)
        // RPUSH se user line ke peeche lag jayega
        await redis.rpush(`queue:${productId}`, userId);

        // 3. Get Position
        // LPOS (Redis 6.0+) user ki position batata hai (0-indexed)
        const position = await redis.lpos(`queue:${productId}`, userId);

        res.status(200).json({ 
            success: true, 
            message: "Joined waitroom", 
            position: position + 1 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};