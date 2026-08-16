// routes/flashSale.js
const Redis = require('ioredis');
const redis = new Redis();

router.post('/enter-waitroom', async (req, res) => {
    const { userId, productId } = req.body;
    
    // 1. Check if user is already in queue
    const position = await redis.lpos(`waitroom:${productId}`, userId);
    
    if (position === null) {
        // 2. Add user to the end of the line
        await redis.rpush(`waitroom:${productId}`, userId);
        const newPos = await redis.llen(`waitroom:${productId}`);
        return res.json({ status: 'queued', position: newPos });
    }
    
    res.json({ status: 'queued', position: position + 1 });
});