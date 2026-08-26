require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { ComfortSimulator, MODES } = require("./comfortEngine");

const app = express();
const simulator = new ComfortSimulator();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool
  .connect()
  .then(() => console.log("Connected to classroom_db successfully!"))
  .catch((err) => console.error("Database connection error", err.stack));

setInterval(() => {
  simulator.tick();
}, 5000);

simulator.tick();

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
  console.log("ComfortSense mock zone simulator active (5s interval)");
});

// ---------------------------------------------------------
// LEGACY TELEMETRY ROUTES (existing dashboard)
// ---------------------------------------------------------

app.post("/api/telemetry", async (req, res) => {
  try {
    // #NNN: Added zone_id to destructured body so the simulator knows which zone to update
    const { co2_level, noise_level, temperature, humidity, entry_type, zone_id } = req.body;

    const newEntry = await pool.query(
      `INSERT INTO sensor_telemetry
      (co2_level, noise_level, temperature, humidity, entry_type)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [co2_level, noise_level, temperature, humidity, entry_type]
    );

    // #NNN: Inject the manual data directly into the live simulator.
    // If no zone_id is provided in the request payload, it defaults to "lecture-hall-4b"
    const targetZone = zone_id || "lecture-hall-4b";
    
    simulator.injectTelemetry(targetZone, {
      co2_level,
      noise_level,
      temperature,
      humidity
    });

    res.status(201).json(newEntry.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error while saving data" });
  }
});

app.get("/api/telemetry", async (req, res) => {
  try {
    const allData = await pool.query(
      `SELECT * FROM sensor_telemetry ORDER BY created_at DESC LIMIT 50`
    );

    res.status(200).json(allData.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error while fetching data" });
  }
});

// ---------------------------------------------------------
// COMFORTSENSE MOCK API
// ---------------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "ComfortSense", mode: "mock-simulation" });
});

app.get("/api/zones", (req, res) => {
  const mode = req.query.mode || "lecture";
  res.json(simulator.getZones(mode));
});

app.get("/api/zones/:id", (req, res) => {
  const mode = req.query.mode || "lecture";
  const zone = simulator.getZone(req.params.id, mode);

  if (!zone) {
    return res.status(404).json({ error: "Zone not found" });
  }

  res.json(zone);
});

app.get("/api/zones/:id/trend", (req, res) => {
  const trend = simulator.getTrend(req.params.id);
  res.json(trend);
});

app.get("/api/student/home", (_req, res) => {
  res.json(simulator.getStudentHome());
});

app.get("/api/lecturer/dashboard", (req, res) => {
  const mode = req.query.mode || simulator.lecturerMode;
  res.json(simulator.getLecturerDashboard(mode));
});

app.post("/api/lecturer/mode", (req, res) => {
  const { mode } = req.body;
  if (!MODES[mode]) {
    return res.status(400).json({ error: "Invalid mode" });
  }

  simulator.setLecturerMode(mode);
  res.json(simulator.getLecturerDashboard(mode));
});

app.get("/api/admin/overview", (_req, res) => {
  res.json(simulator.getAdminOverview());
});

app.get("/api/admin/sensors", (_req, res) => {
  const zones = simulator.getZones();
  res.json(
    zones.map((zone) => ({
      id: `sensor-${zone.id}`,
      zoneId: zone.id,
      zoneName: zone.name,
      status: zone.readings.sensorStatus,
      battery: Math.round(65 + Math.random() * 30),
      signal: Math.round(70 + Math.random() * 25),
      lastUpdated: zone.readings.lastUpdated,
    }))
  );
});

app.post("/api/auth/mock-login", (req, res) => {
  const { email, role } = req.body;
  const normalizedRole = role || "admin";

  if (!["student", "lecturer", "admin"].includes(normalizedRole)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  res.json({
    token: "mock-comfortsense-token",
    user: {
      id: `${normalizedRole}-demo`,
      name:
        normalizedRole === "student"
          ? "Alex Student"
          : normalizedRole === "lecturer"
            ? "Dr. Morgan"
            : "Campus Admin",
      email: email || `${normalizedRole}@university.edu`,
      role: normalizedRole,
    },
  });
});