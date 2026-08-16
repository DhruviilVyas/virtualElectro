import cron from 'node-cron';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

cron.schedule('* * * * *', async () => {
  const expiredOrders = await Order.find({
    status: 'pending',
    expiresAt: { $lt: new Date() }
  });

  for (const order of expiredOrders) {
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = 'Cancelled';
    await order.save();
  }

  if (expiredOrders.length > 0) {
    console.log(`⚡ Restored ${expiredOrders.length} expired orders`);
  }
});