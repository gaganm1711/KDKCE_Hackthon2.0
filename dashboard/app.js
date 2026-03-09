const API_BASE = 'http://localhost:3001';
const INITIAL_CENTER = [21.102, 79.104];

let map, accidentMarker, hospitalMarkers = [], routeLine;

function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true
    }).setView(INITIAL_CENTER, 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    fetchHospitals();
    
    // Smooth scroll for map
    map.on('zoomstart', () => { document.getElementById('map').style.filter = 'blur(2px)'; });
    map.on('zoomend', () => { document.getElementById('map').style.filter = 'none'; });
}

async function fetchHospitals() {
    try {
        const res = await fetch(`${API_BASE}/hospitals`);
        const hospitals = await res.json();
        
        const listEl = document.getElementById('hospitalList');
        listEl.innerHTML = '';

        hospitals.forEach(h => {
             L.circleMarker([h.lat, h.lon], {
                radius: 5,
                fillColor: "#8b5cf6",
                color: "#fff",
                weight: 1.5,
                opacity: 0.8,
                fillOpacity: 0.8
            }).addTo(map);
            
            const div = document.createElement('div');
            div.style.cssText = 'display:flex; justify-content:space-between; padding:0.5rem; background:rgba(255,255,255,0.03); border-radius:0.5rem;';
            div.innerHTML = `<span>${h.name}</span><span style="color:var(--accent)">READY</span>`;
            listEl.appendChild(div);
        });
    } catch (e) {
        console.error("Fetch hospitals failed", e);
    }
}

async function triggerSimulation() {
    console.log("🛠 Manual override triggered");
    const lat = 21.100 + (Math.random() - 0.5) * 0.04;
    const lon = 79.100 + (Math.random() - 0.5) * 0.04;
    
    try {
        await fetch(`${API_BASE}/accident`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: lat, longitude: lon })
        });
    } catch (e) {
        console.error("Manual signal failed", e);
    }
}

// THE LIVE UPDATE ENGINE
async function pollStatus() {
    try {
        const res = await fetch(`${API_BASE}/status`);
        const data = await res.json();
        
        if (data.status === "Emergency Detected") {
            const lastSeen = localStorage.getItem('lastAccidentTime');
            if (data.timestamp !== lastSeen) {
                localStorage.setItem('lastAccidentTime', data.timestamp);
                handleLiveAccident(data);
            }
        }
    } catch (e) {
        console.warn("Retrying link to server...");
    }
}

function handleLiveAccident(data) {
    const { location, nearestHospital } = data;

    // UI Updates
    document.getElementById('emergencyStatus').classList.add('emergency-active');
    document.getElementById('emergencyStatus').querySelector('.status-value').innerText = "IMPACT DETECTED";
    document.getElementById('latVal').innerText = location.latitude.toFixed(6);
    document.getElementById('lonVal').innerText = location.longitude.toFixed(6);

    // Map Updates
    if (accidentMarker) map.removeLayer(accidentMarker);
    const icon = L.divIcon({ html: '<div class="pulse-purple"></div>', iconSize: [24, 24] });
    accidentMarker = L.marker([location.latitude, location.longitude], { icon }).addTo(map);

    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.polyline([
        [location.latitude, location.longitude],
        [nearestHospital.lat, nearestHospital.lon]
    ], { color: '#fbbf24', weight: 4, dashArray: '10, 15', opacity: 0.9 }).addTo(map);

    map.flyTo([location.latitude, location.longitude], 15, { duration: 1.5 });

    // Intelligence Card
    document.getElementById('hospitalInfo').innerHTML = `
        <div class="hospital-result">
            <div class="hospital-name">${nearestHospital.name}</div>
            <div class="hospital-stats">
                <span class="stat-chip">DIST: ${nearestHospital.distance} KM</span>
                <span class="stat-chip" style="color:var(--accent)">MODE: A*</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 1rem;">
                AI Route optimized for emergency response. Tracking telemetry...
            </div>
            <a href="tel:${nearestHospital.phone}" class="contact-btn">ESTABLISH COMM LINK</a>
        </div>
    `;
    
    // Trigger browser notification (feedback)
    console.log(`🚨 ALERT: ${nearestHospital.name} CONTACTED`);
}

function resetUI() {
    if (accidentMarker) map.removeLayer(accidentMarker);
    if (routeLine) map.removeLayer(routeLine);
    accidentMarker = null; routeLine = null;
    map.flyTo(INITIAL_CENTER, 14);
    
    document.getElementById('emergencyStatus').classList.remove('emergency-active');
    document.getElementById('emergencyStatus').querySelector('.status-value').innerText = "Active Monitoring";
    document.getElementById('latVal').innerText = "--.------";
    document.getElementById('lonVal').innerText = "--.------";
    document.getElementById('hospitalInfo').innerHTML = `<div style="text-align: center; color: var(--text-dim); padding: 1rem; border: 1px dashed var(--glass-border); border-radius: 1rem;"><p style="font-size: 0.8rem;">Waiting for impact telemetry...</p></div>`;
}

// Listeners
document.getElementById('triggerAccident').addEventListener('click', triggerSimulation);
document.getElementById('resetSimulation').addEventListener('click', resetUI);

// Start Engine
setInterval(pollStatus, 2000);
window.onload = initMap;
