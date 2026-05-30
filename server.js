import express from "express";
import cors from "cors";
import { db } from "./db.js";
import authRoutes from "./routes/auth.js";
import vehicleRoutes from "./routes/vehicles.js";
import bookingRoutes from "./routes/bookings.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Mount
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);

// Public utility endpoints
// @route   GET api/services
// @desc    Get all available vehicle services
app.get("/api/services", (req, res) => {
  try {
    const services = db.getServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

// @route   GET api/mechanics
// @desc    Get all mechanics (Admin utility)
app.get("/api/mechanics", (req, res) => {
  try {
    const mechanics = db.getMechanics();
    res.json(mechanics);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch mechanics" });
  }
});

// Simple root diagnostic route
app.get("/", (req, res) => {
  res.json({ message: "AutoServe Full-Stack Backend API is running successfully!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[AutoServe Backend] Server running on port ${PORT}`);
});
