const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'mamatha-cooks-secret-key-super-secure';
const MONGO_URI = process.env.MONGO_URI;

// Shiprocket Credentials
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

app.use(cors());
app.use(express.json());

// Serve static images from payment folder
app.use('/payment', express.static(path.join(__dirname, 'payment')));

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// --- SCHEMAS & MODELS ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  addresses: [{
    fullName: String,
    streetAddress: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String,
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  shippingAddress: {
    fullName: String,
    streetAddress: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String,
  },
  status: { type: String, default: 'Confirmed' }, // Processing, Shipped, Delivered
  shiprocketOrderId: String,
  shiprocketShipmentId: String,
  awbCode: String
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);


// --- HELPER FUNCTION: SHIPROCKET AUTH ---
let shiprocketToken = null;
let tokenExpiry = null;

const getShiprocketToken = async () => {
  if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
    return shiprocketToken;
  }
  try {
    const res = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD
    });
    shiprocketToken = res.data.token;
    // Set token expiry (Shiprocket token valid for 10 days, let's set it to 9 days to be safe)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 9);
    tokenExpiry = expiryDate;
    return shiprocketToken;
  } catch (error) {
    console.error('Shiprocket Auth Error:', error.response?.data || error.message);
    throw new Error('Could not authenticate with Shiprocket');
  }
};


// --- ROUTES ---

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

// Get Current User
app.get('/api/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: 'Invalid token format.' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ id: user._id, email: user.email, addresses: user.addresses });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// Add new address
app.post('/api/user/addresses', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: 'Invalid token format.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({ message: 'Address added', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// CREATE ORDER (Shiprocket Integration)
app.post('/api/orders', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { items, totalPrice, addressIndex } = req.body;
    const shippingAddress = user.addresses[addressIndex];

    if (!items || !totalPrice || !shippingAddress) {
      return res.status(400).json({ message: 'Missing order details' });
    }

    // 1. Create DB Order first (to get local unique Order ID)
    const newOrder = new Order({
      user: user._id,
      items,
      totalAmount: totalPrice,
      shippingAddress,
      status: 'Confirmed'
    });
    await newOrder.save();

    // 2. Format Items for Shiprocket & Calculate Weight/Dimensions
    let totalItemsCount = 0;
    let actualTotalWeight = 0;

    const orderItems = items.map(item => {
      totalItemsCount += item.quantity || 1;
      actualTotalWeight += (item.shippingWeight || 0.5) * (item.quantity || 1);
      
      const itemName = item.product?.name || item.name || "Product";
      const itemLabel = item.weightLabel ? ` (${item.weightLabel})` : '';

      return {
        name: itemName + itemLabel,
        sku: `PROD-${item.product?.id || item.id || Math.floor(Math.random() * 1000)}`,
        units: item.quantity,
        selling_price: item.price || item.product?.price || 0
      };
    });

    // Dynamic Weight Calculation
    let calculatedWeight = Math.max(0.25, actualTotalWeight);

    // Dynamic Dimensions Calculation: Approximate packing box size
    // 1 jar = 10x10x15 cm. Multiple jars packed side by side.
    const rows = Math.ceil(Math.sqrt(totalItemsCount));
    const cols = Math.ceil(totalItemsCount / rows);
    const calculatedLength = rows * 10;
    const calculatedBreadth = cols * 10;
    const calculatedHeight = 15;

    // 3. Sync to Shiprocket
    try {
      const srToken = await getShiprocketToken();
      // Date format YYYY-MM-DD
      const orderDate = new Date().toISOString().split('T')[0];
      
      const shiprocketPayload = {
        order_id: newOrder._id.toString(),
        order_date: orderDate,
        pickup_location: "Primary", // default/placeholder
        billing_customer_name: shippingAddress.fullName.split(' ')[0] || "Customer",
        billing_last_name: shippingAddress.fullName.split(' ').slice(1).join(' ') || "Name",
        billing_address: shippingAddress.streetAddress,
        billing_city: shippingAddress.city,
        billing_pincode: shippingAddress.zipCode,
        billing_state: shippingAddress.state,
        billing_country: "India",
        billing_email: user.email,
        billing_phone: shippingAddress.phone || "9999999999",
        shipping_is_billing: true,
        order_items: orderItems,
        payment_method: "Prepaid",
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: totalPrice,
        length: calculatedLength,
        breadth: calculatedBreadth,
        height: calculatedHeight,
        weight: calculatedWeight
      };

      const srRes = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', shiprocketPayload, {
        headers: { Authorization: `Bearer ${srToken}` }
      });

      // Update Local Order with Shiprocket IDs
      if (srRes.data && srRes.data.order_id) {
        newOrder.shiprocketOrderId = srRes.data.order_id;
        newOrder.shiprocketShipmentId = srRes.data.shipment_id;
        await newOrder.save();
        
        // Let's attempt to assign AWB instantly to get awb_code for tracking. 
        // This fails if the seller's pickup location is not properly setup in their own Shiprocket dashboard, but we will wrap in try/catch.
        try {
          const awbRes = await axios.post('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
            shipment_id: srRes.data.shipment_id
          }, {
            headers: { Authorization: `Bearer ${srToken}` }
          });
          
          if (awbRes.data && awbRes.data.response && awbRes.data.response.data && awbRes.data.response.data.awb_code) {
             newOrder.awbCode = awbRes.data.response.data.awb_code;
             await newOrder.save();
          }
        } catch(awbErr) {
           console.log("AWB generation skipped or failed (perhaps pickup location missing): ", awbErr.response?.data?.message || awbErr.message);
        }
      }
    } catch (srError) {
      console.error('Shiprocket Sync Error:', srError.response?.data || srError.message);
      // We don't fail the whole request because the user already paid, we just log it.
    }

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Internal server error while creating order' });
  }
});


// GET USER ORDERS
app.get('/api/orders', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: 'Invalid token format.' });
    }

    // Latest first
    const orders = await Order.find({ user: decoded.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// TRACK ORDER
app.get('/api/orders/track/:awb', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const { awb } = req.params;
    if (!awb || awb === 'undefined') {
       return res.status(400).json({ message: 'AWB Code is missing for this order.' });
    }

    const srToken = await getShiprocketToken();
    const trackRes = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
      headers: { Authorization: `Bearer ${srToken}` }
    });
    
    res.json(trackRes.data);
  } catch (error) {
    console.error('Tracking Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Could not fetch tracking data or Shiprocket rejected AWB.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
