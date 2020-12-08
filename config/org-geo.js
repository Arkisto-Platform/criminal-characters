const GeoJSON = require("geojson");

function findGeo(thisPlace, crate) {
    // Find out where a person was convicted by looking for Actions which have a location, which has a geo property
    const locations = crate.resolve(thisPlace, [{"property": "location"}])
    const places = [];
    if (locations) {
        for (let geo of locations) {
            places.push({
                "id": thisPlace["@id"],
                url: geo["@id"], // Will take you to this page
                name: thisPlace.name,
                "latitude": Number(geo.latitude),
                "longitude": Number(geo.longitude),
                description: thisPlace.decription,
                startDate: geo.startDate,
                endDate: geo.endDate
                })
            }  
    }
    return GeoJSON.parse(places, {Point: ['latitude', 'longitude']});
  }
  
  module.exports = findGeo;