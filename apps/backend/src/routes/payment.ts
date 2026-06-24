import express from 'express';
import Razorpay from 'razorpay';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

router.post('/create-order', async (req, res) => {
  try {
    const options = {
      amount: 49900, 
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`,
    };
    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ error: "Failed to create order" });
    }
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;