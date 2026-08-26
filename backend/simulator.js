// simulator.js
const API_URL = "http://localhost:5000/api/telemetry";

// Helper function to generate realistic random numbers
function getRandom(min, max) {
    return (Math.random() * (max - min) + min).toFixed(1);
}

async function sendAutomaticData() {
    // Generate simulated environmental data
    const payload = {
        co2_level: getRandom(400, 850),    // Simulate normal to slightly elevated CO2
        noise_level: getRandom(35, 60),    // Simulate ambient classroom noise
        temperature: getRandom(22, 26),    // Simulate comfortable room temperature
        humidity: getRandom(45, 60),       // Simulate normal humidity
        entry_type: "automatic"            // Tags this data as automatic in the database
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`[AUTOMATIC STREAM] Sent: CO2=${payload.co2_level}ppm | Temp=${payload.temperature}°C`);
        } else {
            console.error("[AUTOMATIC STREAM] Server rejected the data.");
        }
    } catch (error) {
        console.error("[AUTOMATIC STREAM] Error connecting to server:", error.message);
    }
}

console.log("Starting IoT Sensor Simulator...");
console.log("Pushing automated data every 5 seconds. Press Ctrl+C to stop.");

// Send the first batch immediately, then loop every 5000 milliseconds (5 seconds)
sendAutomaticData();
setInterval(sendAutomaticData, 5000);