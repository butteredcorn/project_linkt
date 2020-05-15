const degreesToRadians = (degree) => {
    return degree * (Math.PI/180)
}
/**
 * 
 * Haversine's formula
 * 
 */
const getDistanceFromLatitudeLongitudeInKm = (latitudeA, longitudeA, latitudeB, longitudeB) => {
    const EARTH_RADIUS_KMS = 6371; // Radius of the earth in km
    const latitudeDifference = degreesToRadians(latitudeB-latitudeA);  // deg2rad below
    const longitudeDifference = degreesToRadians(longitudeB-longitudeA); 

    const a = 
      Math.sin(latitudeDifference/2) * Math.sin(latitudeDifference/2) +
      Math.cos(degreesToRadians(latitudeA)) * Math.cos(degreesToRadians(latitudeB)) * 
      Math.sin(longitudeDifference/2) * Math.sin(longitudeDifference/2); 

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 

    const distanceInKMS = Math.round((EARTH_RADIUS_KMS * c) * 10)/10; // Distance in km, rounded to the tenth's position
    
    return distanceInKMS;
}


/**
 * 
 * performant version
 * 
 */
function getDistanceFromLatitudeLongitudeInKmPerformant(latitudeA, longitudeA, latitudeB, longitudeB) {
    const DEGREE_IN_RADIANS = 0.017453292519943295;    // Math.PI / 180 degree to radians
    const cos = Math.cos;

    var a = 0.5 - cos((latitudeB - latitudeA) * DEGREE_IN_RADIANS)/2 + 
            cos(latitudeA * DEGREE_IN_RADIANS) * cos(latitudeB * DEGREE_IN_RADIANS) * 
            (1 - cos((longitudeB - longitudeA) * DEGREE_IN_RADIANS))/2;
  
    return Math.round((12742 * Math.asin(Math.sqrt(a))) * 10) / 10; // 2 * R; R = 6371 km
  }

  module.exports = {
    getDistanceFromLatitudeLongitudeInKmPerformant
  }