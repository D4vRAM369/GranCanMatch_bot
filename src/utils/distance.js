// Fórmula de Haversine para calcular distancia entre dos puntos (lat, lon)
// Retorna distancia en km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radio de la tierra en km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distancia en km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = {
    getDistanceFromLatLonInKm
};
