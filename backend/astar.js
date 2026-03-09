/**
 * Simple A* algorithm implementation for finding the nearest hospital.
 * In a real scenario, this would navigate a road network graph.
 * For this simulation, we treat each hospital as a potential goal node
 * and evaluate them based on distance.
 */

function haversineDistance(coords1, coords2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const { lat: lat1, lon: lon1 } = coords1;
    const { lat: lat2, lon: lon2 } = coords2;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * findNearestHospital
 * @param {Object} start {lat, lon}
 * @param {Array} hospitals
 * @returns {Object} {nearest, rankedHospitals}
 */
function findNearestHospital(start, hospitals) {
    // For a simple world without obstacles, A* with straight-line distance 
    // effectively ranks by distance. 
    // We simulate the "Algorithm" by calculating scores for each hospital.
    
    const results = hospitals.map(hospital => {
        const distance = haversineDistance(start, hospital);
        return {
            ...hospital,
            distance: parseFloat(distance.toFixed(2)),
            score: distance // Simplified f(n) = g(n) + h(n), here h(n) = distance, g(n) = 0
        };
    });

    // Sort by score (distance)
    results.sort((a, b) => a.score - b.score);

    return {
        nearest: results[0],
        ranked: results
    };
}

module.exports = { findNearestHospital, haversineDistance };
