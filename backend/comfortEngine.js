const { createThermalOccupancy, driftThermalOccupancy } = require("./thermalEngine");

const MODES = {
  lecture: { noiseOptimal: 55, noiseWarn: 65, label: "Lecture" },
  exam: { noiseOptimal: 40, noiseWarn: 50, label: "Exam" },
  group: { noiseOptimal: 65, noiseWarn: 75, label: "Group" },
};

const ZONES = [
  { id: "library-north", name: "Library North Wing", building: "Main Library", floor: 2, type: "library", capacity: 220, baselineNoise: 32 },
  { id: "study-hall-a", name: "Study Hall A", building: "Student Center", floor: 1, type: "study", capacity: 140, baselineNoise: 38 },
  { id: "lecture-hall-4b", name: "Lecture Hall 4B", building: "Science Block", floor: 4, type: "lecture", capacity: 120, baselineNoise: 45 },
  { id: "science-cafe", name: "Science Block Cafe", building: "Science Block", floor: 1, type: "study", capacity: 90, baselineNoise: 52 },
  { id: "main-reading", name: "Main Library Reading Room", building: "Main Library", floor: 1, type: "library", capacity: 180, baselineNoise: 35 },
  { id: "union-lounge", name: "Student Union Lounge", building: "Student Union", floor: 2, type: "study", capacity: 160, baselineNoise: 58 },
  { id: "lab-102", name: "Lab 102", building: "Engineering", floor: 1, type: "lab", capacity: 48, baselineNoise: 42 },
  { id: "quiet-study-3", name: "Quiet Study 3", building: "Main Library", floor: 3, type: "study", capacity: 48, baselineNoise: 28 },
  { id: "faculty-lounge", name: "Faculty Lounge", building: "Admin Block", floor: 2, type: "study", capacity: 20, baselineNoise: 40 },
  { id: "lecture-hall-a", name: "Lecture Hall A", building: "Arts Block", floor: 2, type: "lecture", capacity: 150, baselineNoise: 48 },
];

function randomBetween(min, max) { return Math.random() * (max - min) + min; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function classifyNoise(noise, mode = "lecture") {
  const thresholds = MODES[mode] || MODES.lecture;
  if (noise <= thresholds.noiseOptimal) return "Quiet";
  if (noise <= thresholds.noiseWarn) return "Moderate";
  return "Disruptive";
}

function classifyAirQuality(co2) {
  if (co2 <= 600) return "Fresh";
  if (co2 <= 900) return "Moderate";
  return "Stale";
}

function classifyOccupancy(current, capacity) {
  const ratio = current / capacity;
  if (ratio <= 0.45) return "Low";
  if (ratio <= 0.75) return "Filling up";
  return "Crowded";
}

function classifyTemperature(temp) {
  if (temp >= 20 && temp <= 24) return "Optimal";
  if (temp >= 18 && temp <= 26) return "Acceptable";
  return "Uncomfortable";
}

function getComfortStatus(score) {
  if (score >= 75) return "optimal";
  if (score >= 50) return "warning";
  return "critical";
}

function getComfortLabel(score) {
  if (score >= 85) return "Optimal";
  if (score >= 70) return "Good";
  if (score >= 50) return "Moderate";
  return "Poor";
}

function calculateComfortIndex(readings, mode = "lecture") {
  const { co2, noise, temperature, humidity, occupancy, capacity } = readings;
  const modeConfig = MODES[mode] || MODES.lecture;
  let score = 100;

  if (co2 > 1000) score -= 35;
  else if (co2 > 800) score -= 22;
  else if (co2 > 600) score -= 10;

  if (noise > modeConfig.noiseWarn + 10) score -= 30;
  else if (noise > modeConfig.noiseWarn) score -= 18;
  else if (noise > modeConfig.noiseOptimal) score -= 8;

  if (temperature < 18 || temperature > 26) score -= 18;
  else if (temperature < 20 || temperature > 24) score -= 8;

  if (humidity < 35 || humidity > 65) score -= 10;
  else if (humidity < 40 || humidity > 60) score -= 4;

  const occupancyRatio = occupancy / Math.max(capacity, 1);
  if (occupancyRatio > 0.9) score -= 18;
  else if (occupancyRatio > 0.75) score -= 10;
  else if (occupancyRatio > 0.6) score -= 4;

  return clamp(Math.round(score), 0, 100);
}

function buildAlert(zone, readings, mode = "lecture") {
  const alerts = [];
  
  // #NNN: Rounding values to fix long decimals in UI
  const co2 = Math.round(readings.co2);
  const noise = Number(readings.noise.toFixed(1));
  const humidity = Number(readings.humidity.toFixed(1));
  const temp = Number(readings.temperature.toFixed(1));

  // #NNN: 1. Predictive Air Quality (Lecturer / Admin with Time-to-Threshold)
  if (co2 >= 750) {
    const stagnationRate = 12;
    const ttt = Math.max(1, Math.round((1000 - co2) / stagnationRate));
    alerts.push({
      id: `${zone.id}-co2-pred`,
      zoneId: zone.id,
      zoneName: zone.name,
      severity: ttt < 15 ? "critical" : "warning",
      title: "Predictive Air Quality Warning",
      message: `CO2 is currently ${co2}ppm and rising.`,
      reason: "High Air Stagnation Rate detected due to poor ventilation trends.",
      recommendation: "Activate HVAC or open windows immediately.",
      timeToThreshold: ttt,
      audience: ["lecturer", "admin"], // #NNN: Restricted to Lecturer/Admin
      createdAt: new Date().toISOString(),
    });
  }

  // #NNN: 2. Immediate Window Action (Student)
  if (co2 > 790) {
    alerts.push({
      id: `${zone.id}-co2-action`,
      zoneId: zone.id,
      zoneName: zone.name,
      severity: "critical",
      title: "High CO2 Levels",
      message: "Nearest windows open.",
      reason: `CO2 is rising (${co2}ppm) which causes drowsiness.`,
      recommendation: "Open nearest windows immediately.",
      audience: ["student"], // #NNN: Sent to Student to take action
      createdAt: new Date().toISOString(),
    });
  }

  // #NNN: 3. Noise Disruption (Student + Lecturer)
  const noiseThreshold = MODES[mode]?.noiseWarn || 65;
  if (noise > noiseThreshold) {
    alerts.push({
      id: `${zone.id}-noise`,
      zoneId: zone.id,
      zoneName: zone.name,
      severity: "warning",
      title: "Acoustic Disruption",
      message: "Please be silent, don't disturb lecture.",
      reason: `Ambient noise is ${noise}dB (Room baseline is ${zone.baselineNoise}dB).`,
      recommendation: "Address the class to lower voice levels.",
      audience: ["student", "lecturer"], // #NNN: Both see this
      createdAt: new Date().toISOString(),
    });
  }

  // #NNN: 4. Humidity Alert (Lecturer / Admin)
  if (humidity > 65 || humidity < 40) {
    alerts.push({
      id: `${zone.id}-humidity`,
      zoneId: zone.id,
      zoneName: zone.name,
      severity: "info",
      title: "Humidity Alert",
      message: humidity > 65 ? "High humidity. Turn on AC." : "Low humidity. Turn on humidifier.",
      reason: `Current humidity is ${humidity}%.`,
      recommendation: "Adjust room climate controls.",
      audience: ["lecturer", "admin"], // #NNN: Students can't control AC
      createdAt: new Date().toISOString(),
    });
  }

  // #NNN: 5. Seating Alert (Lecturer Only)
  if (readings.thermal && readings.thermal.sparse && readings.thermal.sparse.id === "front") {
    alerts.push({
      id: `${zone.id}-seating`,
      zoneId: zone.id,
      zoneName: zone.name,
      severity: "info",
      title: "Seating Distribution Alert",
      message: "Students are clustering in the back rows.",
      reason: "Front rows are highly sparse.",
      recommendation: "Encourage students to move forward.",
      audience: ["lecturer"], // #NNN: Lecturer only
      createdAt: new Date().toISOString(),
    });
  }
  
  // #NNN: 6. Drowsiness Probability (Lecturer Only)
  if (temp >= 24 && co2 > 700 && noise < 45) {
    alerts.push({
      id: `${zone.id}-drowsiness`,
      zoneId: zone.id,
      zoneName: zone.name,
      severity: "critical",
      title: "High Drowsiness Probability",
      message: "Conditions are highly favorable for student cognitive fatigue.",
      reason: "Combined effect of rising CO2, elevated thermal mass, and lack of acoustic stimulation.",
      recommendation: "Initiate a 2-minute interactive Q&A or a stretch break.",
      audience: ["lecturer"], // #NNN: Lecturer only
      createdAt: new Date().toISOString(),
    });
  }

  return alerts;
}

function createInitialReadings(zone) {
  const profile = {
    "library-north": { co2: [400, 520], noise: [28, 36], temp: [20, 22], humidity: [45, 52], occupancy: [120, 190] },
    "study-hall-a": { co2: [420, 580], noise: [34, 44], temp: [21, 23], humidity: [46, 55], occupancy: [75, 125] },
    "lecture-hall-4b": { co2: [550, 720], noise: [42, 52], temp: [22, 24], humidity: [48, 58], occupancy: [88, 108] },
    "science-cafe": { co2: [480, 650], noise: [48, 58], temp: [21, 23], humidity: [44, 52], occupancy: [50, 82] },
    "main-reading": { co2: [430, 560], noise: [30, 38], temp: [20, 22], humidity: [45, 54], occupancy: [95, 155] },
    "union-lounge": { co2: [600, 820], noise: [55, 68], temp: [22, 25], humidity: [50, 62], occupancy: [90, 145] },
    "lab-102": { co2: [900, 1100], noise: [40, 48], temp: [23, 25], humidity: [52, 60], occupancy: [28, 42] },
    "quiet-study-3": { co2: [500, 680], noise: [26, 34], temp: [20, 22], humidity: [46, 54], occupancy: [18, 36] },
    "faculty-lounge": { co2: [420, 540], noise: [36, 44], temp: [21, 23], humidity: [45, 52], occupancy: [6, 14] },
    "lecture-hall-a": { co2: [450, 580], noise: [44, 52], temp: [22, 24], humidity: [47, 56], occupancy: [95, 128] },
  }[zone.id] || {
    co2: [450, 650], noise: [35, 50], temp: [21, 23], humidity: [45, 55], occupancy: [10, 30],
  };

  const readings = {
    co2: randomBetween(profile.co2[0], profile.co2[1]),
    noise: randomBetween(profile.noise[0], profile.noise[1]),
    temperature: randomBetween(profile.temp[0], profile.temp[1]),
    humidity: randomBetween(profile.humidity[0], profile.humidity[1]),
    occupancy: Math.round(randomBetween(profile.occupancy[0], profile.occupancy[1])),
    settledRatio: randomBetween(0.65, 0.95),
    sensorStatus: "online",
    lastUpdated: new Date().toISOString(),
  };

  const thermal = createThermalOccupancy(zone, readings.occupancy, readings.temperature);
  readings.occupancy = thermal.frame.headcount;
  readings.settledRatio = thermal.frame.settledRatio;
  readings.thermalPeople = thermal.people;
  readings.thermal = thermal.frame;

  return readings;
}

function driftReadings(zone, current) {
  const drift = (value, amount, min, max) => clamp(value + randomBetween(-amount, amount), min, max);

  const next = {
    co2: drift(current.co2, 18, 380, 1200),
    noise: drift(current.noise, 4, zone.baselineNoise - 8, zone.baselineNoise + 25),
    temperature: drift(current.temperature, 0.4, 18, 28),
    humidity: drift(current.humidity, 2, 35, 70),
    occupancy: Math.round(drift(current.occupancy, Math.max(4, zone.capacity * 0.03), 0, zone.capacity)),
    settledRatio: clamp(drift(current.settledRatio, 0.05, 0.4, 0.98), 0.4, 0.98),
    sensorStatus: Math.random() > 0.985 ? "stale" : "online",
    lastUpdated: new Date().toISOString(),
  };

  const thermal = driftThermalOccupancy(zone, current.thermalPeople || [], next.occupancy, next.temperature);
  next.occupancy = thermal.frame.headcount;
  next.settledRatio = thermal.frame.settledRatio;
  next.thermalPeople = thermal.people;
  next.thermal = thermal.frame;

  return next;
}

function enrichZone(zone, readings, mode = "lecture") {
  const { thermalPeople: _thermalPeople, ...publicReadings } = readings;
  const comfortIndex = calculateComfortIndex(
    { co2: readings.co2, noise: readings.noise, temperature: readings.temperature, humidity: readings.humidity, occupancy: readings.occupancy, capacity: zone.capacity }, mode
  );

  return {
    ...zone,
    readings: {
      ...publicReadings,
      co2: Number(readings.co2.toFixed(0)),
      noise: Number(readings.noise.toFixed(1)),
      temperature: Number(readings.temperature.toFixed(1)),
      humidity: Number(readings.humidity.toFixed(1)),
      noiseCategory: classifyNoise(readings.noise, mode),
      airQuality: classifyAirQuality(readings.co2),
      occupancyLabel: classifyOccupancy(readings.occupancy, zone.capacity),
      temperatureLabel: classifyTemperature(readings.temperature),
    },
    comfortIndex,
    comfortLabel: getComfortLabel(comfortIndex),
    comfortStatus: getComfortStatus(comfortIndex),
    alerts: buildAlert(zone, readings, mode), 
  };
}

class ComfortSimulator {
  constructor() {
    this.zoneStates = new Map();
    this.history = new Map();
    this.lecturerMode = "lecture";

    for (const zone of ZONES) {
      const readings = createInitialReadings(zone);
      this.zoneStates.set(zone.id, readings);
      this.history.set(zone.id, []);
    }
  }

  injectTelemetry(zoneId, data) {
    const current = this.zoneStates.get(zoneId);
    if (!current) return false;

    const updated = {
      ...current,
      co2: data.co2_level ? Number(data.co2_level) : current.co2,
      noise: data.noise_level ? Number(data.noise_level) : current.noise,
      temperature: data.temperature ? Number(data.temperature) : current.temperature,
      humidity: data.humidity ? Number(data.humidity) : current.humidity,
      sensorStatus: "online",
      lastUpdated: new Date().toISOString(),
    };

    this.zoneStates.set(zoneId, updated);
    return true;
  }

  tick() {
    for (const zone of ZONES) {
      const current = this.zoneStates.get(zone.id);
      const next = driftReadings(zone, current);
      this.zoneStates.set(zone.id, next);

      const history = this.history.get(zone.id);
      history.push({
        timestamp: next.lastUpdated,
        comfortIndex: calculateComfortIndex({
          co2: next.co2, noise: next.noise, temperature: next.temperature, humidity: next.humidity, occupancy: next.occupancy, capacity: zone.capacity
        }, this.lecturerMode),
        co2: Number(next.co2.toFixed(0)),
        noise: Number(next.noise.toFixed(1)),
        temperature: Number(next.temperature.toFixed(1)),
      });

      if (history.length > 24) history.shift();
    }
  }

  getZones(mode = this.lecturerMode) {
    return ZONES.map((zone) => enrichZone(zone, this.zoneStates.get(zone.id), mode)).sort((a, b) => b.comfortIndex - a.comfortIndex);
  }

  getZone(zoneId, mode = this.lecturerMode) {
    const zone = ZONES.find((item) => item.id === zoneId);
    if (!zone) return null;
    return enrichZone(zone, this.zoneStates.get(zoneId), mode);
  }

  getTrend(zoneId) { return this.history.get(zoneId) || []; }

  getAdminOverview(mode = this.lecturerMode) {
    const zones = this.getZones(mode);
    // #NNN: Filtering Admin alerts based on Audience tag
    const alerts = zones.flatMap((zone) => zone.alerts).filter(a => a.audience.includes("admin")).sort((a, b) => (a.severity === "critical" ? -1 : 1));

    return {
      zonesMonitored: zones.length, zonesOptimal: zones.filter((zone) => zone.comfortStatus === "optimal").length,
      zonesWarning: zones.filter((zone) => zone.comfortStatus === "warning").length, zonesCritical: zones.filter((zone) => zone.comfortStatus === "critical").length,
      sensorsOnline: zones.filter((zone) => zone.readings.sensorStatus === "online").length, sensorsStale: zones.filter((zone) => zone.readings.sensorStatus !== "online").length,
      activeAlerts: alerts.length, alerts, zones,
    };
  }

  getStudentHome() {
    const zones = this.getZones("lecture");
    const optimal = zones[0];
    const nearest = zones.find((zone) => zone.id === "study-hall-a") || zones[1];

    // #NNN: Filtering Student alerts based on Audience tag
    const realAlerts = zones
      .flatMap((zone) => zone.alerts)
      .filter((alert) => alert.audience.includes("student"));

    return {
      optimalZone: optimal, nearestZone: nearest, zones: zones.slice(0, 6),
      studentAlerts: realAlerts,
    };
  }

  setLecturerMode(mode) { if (MODES[mode]) this.lecturerMode = mode; }

  getLecturerDashboard(mode = this.lecturerMode) {
    const zone = this.getZone("lecture-hall-4b", mode);
    // #NNN: Filtering Lecturer alerts based on Audience tag
    const alerts = (zone?.alerts || []).filter(a => a.audience.includes("lecturer"));
    return { zone, mode, trend: this.getTrend("lecture-hall-4b"), alerts };
  }
}

module.exports = { ComfortSimulator, MODES, ZONES, calculateComfortIndex };