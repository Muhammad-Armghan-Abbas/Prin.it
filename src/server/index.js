const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Your React app URL
  credentials: true
}));
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Routes
app.post('/api/setAdminClaim', async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    res.json({ success: true, message: 'Admin claim set successfully' });
  } catch (error) {
    console.error('Error setting admin claim:', error);
    res.status(500).json({ error: error.message });
  }
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    // Implement your product fetching logic here
    const products = []; // Replace with actual database query
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;
    // Implement your product creation logic here
    const newProduct = { id: Date.now(), name, price, description, imageUrl };
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Admin server running on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
