import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Default seeding data
const DEFAULT_SERVICES = [
  { id: 1, icon: "🛢️", name: "Oil Change", desc: "Full synthetic oil change with filter", price: 499, duration: "1-2 hrs" },
  { id: 2, icon: "⚙️", name: "Engine Repair", desc: "Diagnostics and engine overhaul", price: 1999, duration: "3-5 hrs" },
  { id: 3, icon: "🚿", name: "Water Wash", desc: "Exterior & interior deep clean", price: 299, duration: "1 hr" },
  { id: 4, icon: "🔋", name: "Battery Check", desc: "Battery test and replacement", price: 199, duration: "30 min" },
  { id: 5, icon: "🔄", name: "Wheel Alignment", desc: "4-wheel computer alignment", price: 799, duration: "1-2 hrs" },
  { id: 6, icon: "🛑", name: "Brake Service", desc: "Pad, rotor inspect & replace", price: 899, duration: "2-3 hrs" },
  { id: 7, icon: "❄️", name: "AC Repair", desc: "Gas refill & full AC service", price: 1299, duration: "2-3 hrs" },
  { id: 8, icon: "🔧", name: "Tire Replacement", desc: "Fitting, balancing & nitrogen fill", price: 599, duration: "1 hr" },
];

const DEFAULT_MECHANICS = ["Suresh M.", "Karthik R.", "Mani S.", "Raj T.", "Kumar A."];

// Ensure DB directory and file exist with initial seed
function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const userHash = bcrypt.hashSync("user123", salt);
    const adminHash = bcrypt.hashSync("admin123", salt);

    const initialData = {
      users: [
        { id: "u1", name: "jayaraj", email: "user@jayaraj.com", passwordHash: userHash, role: "user", phone: "9876543210", joined: "May 2025" },
        { id: "u2", name: "Mukesh", email: "admin@mukesh.com", passwordHash: adminHash, role: "admin", phone: "9123456780", joined: "May 2025" }
      ],
      vehicles: [
        { id: "v1", userId: "u1", name: "Honda City", plate: "TN 01 AB 1234", fuel: "Petrol", model: "2021" },
        { id: "v2", userId: "u1", name: "Maruti Swift", plate: "TN 02 CD 5678", fuel: "Diesel", model: "2019" }
      ],
      bookings: [
        {
          id: "VSB-001",
          userId: "u1",
          user: "jayaraj",
          email: "user@jayaraj.com",
          services: [DEFAULT_SERVICES[0]], // Oil Change
          totalPrice: 499,
          vehicle: "Honda City (TN 01 AB 1234)",
          date: "2025-05-20",
          time: "10:00 AM",
          status: "Completed",
          mechanic: "Suresh M.",
          notes: "Initial oil change"
        },
        {
          id: "VSB-002",
          userId: "u1",
          user: "jayaraj",
          email: "user@jayaraj.com",
          services: [DEFAULT_SERVICES[4]], // Wheel Alignment
          totalPrice: 799,
          vehicle: "Honda City (TN 01 AB 1234)",
          date: "2025-05-28",
          time: "02:00 PM",
          status: "In Service",
          mechanic: "Karthik R.",
          notes: "Align front wheels"
        }
      ],
      services: DEFAULT_SERVICES,
      mechanics: DEFAULT_MECHANICS
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
  }
}

// Read DB file
function readDb() {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file, resetting:", err);
    // Return empty fallback structure
    return { users: [], vehicles: [], bookings: [], services: DEFAULT_SERVICES, mechanics: DEFAULT_MECHANICS };
  }
}

// Write DB file
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing to database file:", err);
    return false;
  }
}

// DB Access API
export const db = {
  // Users
  getUsers: () => readDb().users,
  getUserById: (id) => readDb().users.find((u) => u.id === id),
  getUserByEmail: (email) => readDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  addUser: (user) => {
    const data = readDb();
    const newUser = { id: "u_" + Math.random().toString(36).substr(2, 9), joined: "May 2026", ...user };
    data.users.push(newUser);
    writeDb(data);
    return newUser;
  },

  // Vehicles
  getVehicles: (userId) => {
    const data = readDb();
    return data.vehicles.filter((v) => v.userId === userId);
  },
  addVehicle: (userId, vehicle) => {
    const data = readDb();
    const newVehicle = { id: "v_" + Math.random().toString(36).substr(2, 9), userId, ...vehicle };
    data.vehicles.push(newVehicle);
    writeDb(data);
    return newVehicle;
  },
  deleteVehicle: (userId, vehicleId) => {
    const data = readDb();
    const index = data.vehicles.findIndex((v) => v.id === vehicleId && v.userId === userId);
    if (index !== -1) {
      data.vehicles.splice(index, 1);
      writeDb(data);
      return true;
    }
    return false;
  },

  // Bookings
  getBookings: (userId, role) => {
    const data = readDb();
    if (role === "admin") {
      return data.bookings;
    }
    return data.bookings.filter((b) => b.userId === userId);
  },
  addBooking: (userId, userName, userEmail, booking) => {
    const data = readDb();
    const newBooking = {
      id: "VSB-" + Math.floor(1000 + Math.random() * 9000),
      userId,
      user: userName,
      email: userEmail,
      status: "Pending",
      mechanic: "Pending",
      ...booking
    };
    data.bookings.push(newBooking);
    writeDb(data);
    return newBooking;
  },
  updateBooking: (bookingId, updates) => {
    const data = readDb();
    const idx = data.bookings.findIndex((b) => b.id === bookingId);
    if (idx !== -1) {
      data.bookings[idx] = { ...data.bookings[idx], ...updates };
      writeDb(data);
      return data.bookings[idx];
    }
    return null;
  },

  // Services & Mechanics
  getServices: () => readDb().services,
  getMechanics: () => readDb().mechanics
};

// Initialize the database and directories on module load
initDb();
