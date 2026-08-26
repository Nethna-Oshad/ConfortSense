/**
 * Low-resolution IR occupancy simulation.
 * Models an anonymous thermal array (e.g. 8x16 AMG-style sensor), not a camera.
 * People are heat blobs only — no identity, pose, or imagery.
 */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

const BODY_TEMP_MIN_C = 36.1;
const BODY_TEMP_MAX_C = 37.2;

function layoutForZone(zone) {
  if (zone.type === "lecture") {
    return {
      rows: 12,
      cols: 18,
      aisleCols: [5, 12],
      rowWeight: (row, rows) => 0.06 + Math.pow(row / Math.max(rows - 1, 1), 1.55) * 0.94,
      clusters: [
        { r: 10.4, c: 2.4, radius: 2.8, weight: 1.4 },
        { r: 10.6, c: 15.2, radius: 2.6, weight: 1.25 },
        { r: 8.8, c: 8.5, radius: 2.0, weight: 0.75 },
      ],
    };
  }

  if (zone.type === "library") {
    return {
      rows: 16,
      cols: 24,
      aisleCols: [8, 16],
      rowWeight: (row, rows) => {
        const t = row / Math.max(rows - 1, 1);
        return 0.4 + 0.5 * Math.sin(t * Math.PI);
      },
      clusters: [
        { r: 3.2, c: 3.5, radius: 3.2, weight: 1.15 },
        { r: 12.4, c: 20.0, radius: 3.4, weight: 1.25 },
        { r: 8.0, c: 12.0, radius: 2.8, weight: 0.9 },
      ],
    };
  }

  if (zone.type === "lab") {
    return {
      rows: 10,
      cols: 16,
      aisleCols: [5, 10],
      rowWeight: () => 0.75,
      clusters: [
        { r: 2.2, c: 2.4, radius: 1.8, weight: 1 },
        { r: 2.2, c: 13.0, radius: 1.8, weight: 1 },
        { r: 7.4, c: 2.4, radius: 1.8, weight: 1 },
        { r: 7.4, c: 13.0, radius: 1.8, weight: 1 },
      ],
    };
  }

  return {
    rows: 14,
    cols: 20,
    aisleCols: [6, 13],
    rowWeight: (row, rows) => 0.35 + (row / Math.max(rows - 1, 1)) * 0.45,
    clusters: [
      { r: 10.5, c: 3.2, radius: 3.0, weight: 1.15 },
      { r: 11.2, c: 16.5, radius: 2.8, weight: 1.1 },
      { r: 4.0, c: 10.0, radius: 2.4, weight: 0.8 },
    ],
  };
}

function pickWeightedIndex(weights) {
  const total = weights.reduce((sum, value) => sum + value, 0);
  let cursor = Math.random() * total;
  for (let i = 0; i < weights.length; i += 1) {
    cursor -= weights[i];
    if (cursor <= 0) return i;
  }
  return weights.length - 1;
}

function clusterBias(layout, row, col) {
  if (!layout.clusters.length) return 1;
  let best = 0.35;
  for (const cluster of layout.clusters) {
    const dist = Math.hypot(row - cluster.r, col - cluster.c);
    const falloff = Math.exp(-(dist * dist) / (2 * cluster.radius * cluster.radius));
    best = Math.max(best, 0.35 + falloff * cluster.weight);
  }
  return best;
}

function isAisle(layout, col) {
  return layout.aisleCols.includes(col);
}

function spawnPerson(layout) {
  const rowWeights = Array.from({ length: layout.rows }, (_, row) =>
    layout.rowWeight(row, layout.rows)
  );
  let row = pickWeightedIndex(rowWeights);
  let col = 0;
  const colWeights = Array.from({ length: layout.cols }, (_, c) => {
    if (isAisle(layout, c)) return 0.01;
    return clusterBias(layout, row, c);
  });
  col = pickWeightedIndex(colWeights);

  return {
    r: clamp(row + randomBetween(-0.08, 0.08), 0, layout.rows - 1),
    c: clamp(col + randomBetween(-0.08, 0.08), 0, layout.cols - 1),
    intensity: randomBetween(0.82, 1),
    settled: Math.random() > 0.22,
  };
}

function rasterize(people, layout, ambientC) {
  const cells = Array.from({ length: layout.rows }, (_, row) =>
    Array.from({ length: layout.cols }, (_, col) => {
      const aisleCool = isAisle(layout, col) ? -0.4 : 0;
      return ambientC + randomBetween(-0.35, 0.45) + aisleCool;
    })
  );

  for (const person of people) {
    const radius = 1;
    const rMin = Math.max(0, Math.floor(person.r) - radius);
    const rMax = Math.min(layout.rows - 1, Math.ceil(person.r) + radius);
    const cMin = Math.max(0, Math.floor(person.c) - radius);
    const cMax = Math.min(layout.cols - 1, Math.ceil(person.c) + radius);
    const peak = 11.5 * person.intensity;

    for (let row = rMin; row <= rMax; row += 1) {
      for (let col = cMin; col <= cMax; col += 1) {
        const dist = Math.hypot(row - person.r, col - person.c);
        const heat = peak * Math.exp(-(dist * dist) / 0.32);
        cells[row][col] += heat;
      }
    }
  }

  return cells.map((row) => row.map((value) => Number(value.toFixed(2))));
}

function countBlobs(cells, thresholdC) {
  const rows = cells.length;
  const cols = cells[0].length;
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  let headcount = 0;

  const neighbors = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (seen[row][col] || cells[row][col] < thresholdC) continue;

      let size = 0;
      const queue = [[row, col]];
      seen[row][col] = true;

      while (queue.length) {
        const [cr, cc] = queue.shift();
        size += 1;
        for (const [dr, dc] of neighbors) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          if (seen[nr][nc] || cells[nr][nc] < thresholdC) continue;
          seen[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }

      headcount += Math.max(1, Math.round(size / 1.35));
    }
  }

  return headcount;
}

function bandForRow(row, rows) {
  const t = row / Math.max(rows - 1, 1);
  if (t < 0.34) return "front";
  if (t < 0.66) return "middle";
  return "back";
}

/**
 * Produces a student-only thermal grid where only human body heat (36.1–37.2°C)
 * is visible. Electronic heat sources (chargers, laptops, PCs) are suppressed
 * back to ambient so the grid purely reflects student presence.
 */
function studentBodyGrid(cells, ambientC) {
  const BODY_HALO_LOW = ambientC + 4.5;
  const BODY_HALO_HIGH = BODY_TEMP_MAX_C + 1.8;

  return cells.map((row) =>
    row.map((temp) => {
      if (temp < BODY_HALO_LOW || temp > BODY_HALO_HIGH) return null;

      const normalized = clamp(
        (temp - BODY_HALO_LOW) / Math.max(BODY_HALO_HIGH - BODY_HALO_LOW, 0.1),
        0,
        1
      );
      return Number(
        (BODY_TEMP_MIN_C + normalized * (BODY_TEMP_MAX_C - BODY_TEMP_MIN_C)).toFixed(1)
      );
    })
  );
}

/**
 * Generate a noise-level grid that mirrors the thermal layout dimensions.
 * Each cell gets a dB value based on proximity to occupied (student) cells,
 * producing a localised noise distribution map.
 */
function generateNoiseGrid(cells, people, layout, baseNoisedB) {
  const rows = layout.rows;
  const cols = layout.cols;
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => baseNoisedB + randomBetween(-2, 2))
  );

  for (const person of people) {
    const noiseContrib = randomBetween(3, 12);
    const radius = 2;
    const rMin = Math.max(0, Math.floor(person.r) - radius);
    const rMax = Math.min(rows - 1, Math.ceil(person.r) + radius);
    const cMin = Math.max(0, Math.floor(person.c) - radius);
    const cMax = Math.min(cols - 1, Math.ceil(person.c) + radius);

    for (let row = rMin; row <= rMax; row += 1) {
      for (let col = cMin; col <= cMax; col += 1) {
        const dist = Math.hypot(row - person.r, col - person.c);
        const falloff = Math.exp(-(dist * dist) / 1.8);
        grid[row][col] += noiseContrib * falloff;
      }
    }
  }

  return grid.map((row) =>
    row.map((v, colIndex) =>
      Number((v + (isAisle(layout, colIndex) ? -3 : 0)).toFixed(1))
    )
  );
}

function analyzeFrame(cells, people, ambientC, layout, zoneType) {
  const rows = cells.length;
  const cols = cells[0].length;
  const thresholdC = Number((ambientC + 5.5).toFixed(1));
  const blobCount = countBlobs(cells, thresholdC);
  const headcount = people.length ? people.length : blobCount;

  const bandIds = ["front", "middle", "back"];
  const bandMeta = {
    front: { label: "Front rows", occupancy: 0 },
    middle: { label: "Middle rows", occupancy: 0 },
    back: { label: "Back rows", occupancy: 0 },
  };

  for (const person of people) {
    bandMeta[bandForRow(person.r, rows)].occupancy += 1;
  }

  const seatsPerBand = {
    front: 0,
    middle: 0,
    back: 0,
  };
  for (let row = 0; row < rows; row += 1) {
    seatsPerBand[bandForRow(row, rows)] += cols;
  }

  const bands = bandIds.map((id) => {
    const occupancy = bandMeta[id].occupancy;
    return {
      id,
      label: bandMeta[id].label,
      occupancy,
      density: Number((occupancy / Math.max(seatsPerBand[id] / 4, 1)).toFixed(2)),
    };
  });

  const ranked = [...bands].sort((a, b) => b.occupancy - a.occupancy);
  const hotspot = ranked[0];
  const sparse = [...bands].sort((a, b) => a.occupancy - b.occupancy)[0];

  let hottest = { row: 0, col: 0, celsius: cells[0][0] };
  let coolest = { row: 0, col: 0, celsius: cells[0][0] };
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const value = cells[row][col];
      if (value > hottest.celsius) hottest = { row, col, celsius: value };
      if (value < coolest.celsius) coolest = { row, col, celsius: value };
    }
  }

  const settledCount = people.filter((person) => person.settled).length;

  const studentCells = studentBodyGrid(cells, ambientC);
  const studentHeadcount = people.length;

  return {
    rows,
    cols,
    ambientC: Number(ambientC.toFixed(1)),
    thresholdC,
    cells,
    studentCells,
    studentHeadcount: people.length || studentHeadcount,
    headcount,
    blobCount,
    settledCount,
    settledRatio: headcount ? Number((settledCount / headcount).toFixed(2)) : 0,
    bands,
    hotspot: {
      id: hotspot.id,
      label: hotspot.label,
      occupancy: hotspot.occupancy,
      share: headcount ? Math.round((hotspot.occupancy / headcount) * 100) : 0,
    },
    sparse: {
      id: sparse.id,
      label: sparse.label,
      occupancy: sparse.occupancy,
      share: headcount ? Math.round((sparse.occupancy / headcount) * 100) : 0,
    },
    hottestCell: { ...hottest, celsius: Number(hottest.celsius.toFixed(1)) },
    coolestCell: { ...coolest, celsius: Number(coolest.celsius.toFixed(1)) },
    paletteMin: Number(Math.min(ambientC - 1, coolest.celsius).toFixed(1)),
    paletteMax: Number(Math.max(ambientC + 14, hottest.celsius).toFixed(1)),
    studentPaletteMin: BODY_TEMP_MIN_C,
    studentPaletteMax: BODY_TEMP_MAX_C,
    zoneType,
    layoutKind: zoneType === "lecture" || zoneType === "lab" ? "classroom" : "open",
    aisleCols: layout.aisleCols || [],
  };
}

function createThermalOccupancy(zone, occupancy, ambientC) {
  const layout = layoutForZone(zone);
  const target = clamp(Math.round(occupancy), 0, zone.capacity);
  const people = Array.from({ length: target }, () => spawnPerson(layout));
  const cells = rasterize(people, layout, ambientC);
  const frame = analyzeFrame(cells, people, ambientC, layout, zone.type);
  frame.noiseGrid = generateNoiseGrid(cells, people, layout, zone.baselineNoise || 35);

  return { people, frame };
}

function driftThermalOccupancy(zone, currentPeople, occupancy, ambientC) {
  const layout = layoutForZone(zone);
  const target = clamp(Math.round(occupancy), 0, zone.capacity);
  let people = currentPeople.map((person) => {
    const jitter = person.settled ? 0.04 : 0.12;
    return {
      ...person,
      r: clamp(person.r + randomBetween(-jitter, jitter), 0, layout.rows - 1),
      c: clamp(person.c + randomBetween(-jitter, jitter), 0, layout.cols - 1),
      settled: Math.random() > 0.08 ? person.settled : !person.settled,
      intensity: clamp(person.intensity + randomBetween(-0.03, 0.03), 0.78, 1),
    };
  });

  while (people.length < target) {
    people.push(spawnPerson(layout));
  }
  while (people.length > target) {
    const restlessIndex = people.findIndex((person) => !person.settled);
    people.splice(restlessIndex >= 0 ? restlessIndex : people.length - 1, 1);
  }

  const cells = rasterize(people, layout, ambientC);
  const frame = analyzeFrame(cells, people, ambientC, layout, zone.type);
  frame.noiseGrid = generateNoiseGrid(cells, people, layout, zone.baselineNoise || 35);
  return { people, frame };
}

module.exports = {
  createThermalOccupancy,
  driftThermalOccupancy,
};
