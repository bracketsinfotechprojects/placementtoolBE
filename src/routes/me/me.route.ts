import express from 'express';

const router = express.Router();

// TODO: Add proper me route handlers when authentication is implemented
router.get('/', (req, res) => {
  res.json({ message: 'Me endpoint - authentication not implemented' });
});

router.put('/', (req, res) => {
  res.json({ message: 'Update me endpoint - authentication not implemented' });
});

export default router;
