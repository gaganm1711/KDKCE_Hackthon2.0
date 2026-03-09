const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const hospitals = require('./hospitals');
const { findNearestHospital } = require('./astar');
const mqtt = require('mqtt');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

let lastAccident = null;

// --- MQTT SETUP ---
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Connect to local Mosquitto
const MQTT_TOPIC = 'helmet/accident/location';

mqttClient.on('connect', () => {
    console.log(`📡 Connected to MQTT Broker! Subscribed to: ${MQTT_TOPIC}`);
    mqttClient.subscribe(MQTT_TOPIC);
});

mqttClient.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log(`\n📬 MQTT Message received on [${topic}]:`, data);
        processAccident(data.lat, data.lon);
    } catch (e) {
        console.error("Failed to parse MQTT message", e);
    }
});

function processAccident(latitude, longitude) {
    if (!latitude || !longitude) return;

    const { nearest, ranked } = findNearestHospital({ lat: latitude, lon: longitude }, hospitals);

    lastAccident = {
        location: { latitude, longitude },
        timestamp: new Date().toISOString(),
        nearestHospital: nearest,
        allHospitals: ranked,
        status: "Emergency Detected"
    };

    console.log(`🚨 Emergency triggered via MQTT at ${latitude}, ${longitude}`);
    console.log(`🏥 Nearest: ${nearest.name} (${nearest.distance} km)`);
}

// Root endpoint to confirm backend is running
app.get('/', (req, res) => {
    res.send('<h1>🚀 Smart Helmet Backend is Running!</h1><p>Open <b>dashboard/index.html</b> in your browser to view the dashboard.</p>');
});

// Endpoint to report an accident (Keep HTTP for backup/testing)
app.post('/accident', (req, res) => {
    const { latitude, longitude } = req.body;
    processAccident(latitude, longitude);
    res.json(lastAccident || { status: "Error processing" });
});

// Endpoint to get the current accident status for the dashboard
app.get('/status', (req, res) => {
    res.json(lastAccident || { status: "Monitoring" });
});

// Endpoint to get hospital list
app.get('/hospitals', (req, res) => {
  res.json(hospitals);
});

app.listen(PORT, () => {
    console.log(`🚀 backend server running on http://localhost:${PORT}`);
});
