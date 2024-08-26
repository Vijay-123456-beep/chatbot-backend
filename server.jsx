const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoURI = 'mongodb+srv://vijaykavuri67:vijay123@cluster0.edfknnp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true }
});

const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate input
    if (!username || !password || !email) {
      return res.status(400).send({ message: 'All fields are required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    res.status(201).send({ message: 'User signed up successfully' });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      if (error.keyPattern.username) {
        res.status(400).send({ message: 'Username already exists' });
      } else if (error.keyPattern.email) {
        res.status(400).send({ message: 'Email already exists' });
      }
    } else {
      res.status(500).send({ message: 'Server error' });
    }
  }
});

// Login Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({ message: 'Both username and password are required' });
    }

    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).send({ message: 'Login successful', username: user.username });
    } else {
      res.status(401).send({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
});

// Chatbot Query Route (for demo purposes)
app.post('/query', (req, res) => {
  const { query } = req.body;

  // Simulated chatbot response
  const botResponse = `You asked: "${query}". This is a simulated response.`;

  res.status(200).send({ answer: botResponse });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
