// Given a crate, and a starting point returen a GeoJSON feature collection found by traversing the crate

const GeoJSON = require("geojson");

function findGeo(thisOrg, crate) {
    // Find out where a court was using its location, which has a geo property - Organizations 
    // Returns a set of places with the same name but Potentially multiple spatio-temporal locations
    const locations = crate.resolve(thisOrg, [{"property": "location"}]) // Return all the locations this org has exsited
    const places = [];
    if (locations) {
        for (let geo of locations) {
            places.push({
                "id": thisOrg["@id"],
                url: geo["@id"], // Will take you to this page
                name: thisOrg.name, // This is the same for all the places we found
                "latitude": Number(geo.latitude), 
                "longitude": Number(geo.longitude),
                description: thisOrg.description,
                startDate: geo.startDate,
                endDate: geo.endDate
                })
            }  
    }
    return GeoJSON.parse(places, {Point: ['latitude', 'longitude']});
  }
  
  module.exports = findGeo;