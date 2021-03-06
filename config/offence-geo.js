const GeoJSON = require("geojson");

function findGeo(offence, crate) {
  // Find out where a person was convicted by looking for Actions which have a location, which has a geo property
    crate.addBackLinks();
    const convictions = crate.resolve(offence, [{"@reverse": true, "property": "offence"}])
    const places = []; // Gonna feed this to the map
  
    for (let c of convictions) {
      const convictionPlace = crate.resolve(c, [{"property": "location"}])
      const convictionGeo = crate.resolve(convictionPlace, [{"property": "location"}]);
      if (convictionGeo) {
        const convictionGeoData = {
          "id": c["@id"],
          url: c["@id"], // Will take you to this page
          name: c.name,
          "latitude": Number(convictionGeo[0].latitude), 
          "longitude": Number(convictionGeo[0].longitude),
          description: c.name
        }
        if (c.startTime) {
            convictionGeoData.startDate = c.startTime;
            }
            if (c.endTime && c.endTime != c.startTime) {
            convictionGeoData.startDate = c.endTime;
            }
        places.push(convictionGeoData);
      }
    }
    return GeoJSON.parse(places, {Point: ['latitude', 'longitude']});
  }
  module.exports = findGeo;