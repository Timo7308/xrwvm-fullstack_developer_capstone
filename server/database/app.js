const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;

// Middleware
app.use(cors());
app.use(express.json()); // JSON Body Parser

// Load seed data (relative to this file)
const reviews_data = JSON.parse(fs.readFileSync(__dirname + "/data/reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync(__dirname + "/data/dealerships.json", 'utf8'));

// Connect to MongoDB
const mongoHost = process.env.MONGO_HOST || "localhost";
const mongoPort = process.env.MONGO_PORT || "27017";
const mongoDB = process.env.MONGO_DB || "dealershipsDB";
const mongoURI = `mongodb://${mongoHost}:${mongoPort}/${mongoDB}`;

mongoose.connect(mongoURI)
  .then(() => {
    console.log(`✅ Connected to MongoDB at ${mongoURI}`);
    seedDatabase();
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });

const Reviews = require('./review');
const Dealerships = require('./dealership');

// Function to seed database
async function seedDatabase() {
  try {
    await Reviews.deleteMany({});
    await Reviews.insertMany(reviews_data['reviews']);
    console.log("✅ Seeded Reviews");

    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealerships_data['dealerships']);
    console.log("✅ Seeded Dealerships");
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  }
}

// Home route
app.get('/', (req, res) => {
  res.send("🚀 Welcome to the Mongoose API");
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find({});
    res.json(documents);
  } catch (err) {
    console.error("❌ Error in /fetchReviews:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch reviews by dealer ID
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({ dealership: req.params.id });
    res.json(documents);
  } catch (err) {
    console.error("❌ Error in /fetchReviews/dealer/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find({});
    res.json(documents);
  } catch (err) {
    console.error("❌ Error in /fetchDealers:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch dealerships by state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const documents = await Dealerships.find({ state: req.params.state });
    res.json(documents);
  } catch (err) {
    console.error("❌ Error in /fetchDealers/:state:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch dealer by ID
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const documents = await Dealerships.find({ id: req.params.id });
    res.json(documents);
  } catch (err) {
    console.error("❌ Error in /fetchDealer/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// Insert a new review
app.post('/insert_review', async (req, res) => {
  try {
    const data = req.body;
    const lastReview = await Reviews.findOne().sort({ id: -1 });
    const newId = lastReview ? lastReview.id + 1 : 1;

    const review = new Reviews({
      id: newId,
      name: data.name,
      dealership: data.dealership,
      review: data.review,
      purchase: data.purchase,
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: data.car_year
    });

    const savedReview = await review.save();
    res.json(savedReview);
  } catch (err) {
    console.error("❌ Error in /insert_review:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
