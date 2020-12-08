const XLSX = require('xlsx');
const program = require('commander');
const fs = require('fs-extra');
const path = require('path');
const ROCrate = require("ro-crate").ROCrate;

program
  .version("0.1.0")
  .description(
    "Extracts data from a spreadsheet to make an RO crate"
  )
  .arguments("<crateDir>")
  .option("-a, --additional-context [context]", "JSON file with context object")
  .option("-p, --places [places]", "Spreadsheet of places (courts)")
  .option("-d, --data [data]", "Data directory from which to copy image files")
  .option("-s, --spreadsheet [spreadsheet]", "Data about the people, convictions etc")
  .action((crateDir) => {destDir = crateDir})
program.parse(process.argv);


const places = {};


function loadPlaces(file){
  var workbook = XLSX.readFile(file);
   const placeData = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);
    //console.log(data);    
    for (let row of placeData) {
        //console.log(Object.keys(row));
        // Latitude	Longitude	Start date	End date	Label	Description
        
        var place = {
            "@type": "Place",
            "name": `Latitude: ${row["Latitude"]} Longitude: ${row["Longitude"]}`,
            "@id": `#${row["Latitude"]},${row["Longitude"]}`,
            "latitude": row["Latitude"],
            "longitude": row["Longitude"],
            "startDate": row["Start date"],
            "endDate": row["End date"],
        }

        
        // 
        var org = {
            "@id": `#court_${row["Place"]}`,
            "@type": "Organization",
            "name": row["Place"],
            "location": [{"@id": place["@id"]}],
            "description": [row["Description"] ? row["Description"] : ""],
            "note": row["note"]
        }
        const prevOrg = crate.getItem(org["@id"]);
        if (prevOrg) {
            prevOrg.description.push(org.description[0]);
            prevOrg.location.push(org.location[0]);
        } else {
            crate.addItem(org);
        }
        crate.addItem(place);
        

        // Place logic
        places[org.name] = org;

    }
}

const crate = new ROCrate();
crate.index();
const root = crate.getRootDataset();
if (program.additionalContext) {
    const additionalContext = JSON.parse(fs.readFileSync(program.additionalContext));
    const newContext = {};
    for (item of additionalContext) {
        crate.addItem(item)
        newContext[item["rdfs:label"]] = item["@id"];
    }
    crate.json_ld["@context"].push(newContext);
}
root.name = "Convictions Sample Data DEMO"
root.hasPart = [{
    "@id": "https://prov.vic.gov.au/explore-collection/explore-topic/justice-crime-and-law/register-male-and-female-prisoners-1855-1947"
  }];
root.hasMember = [];
crate.addItem({
    "@id": "https://prov.vic.gov.au/explore-collection/explore-topic/justice-crime-and-law/register-male-and-female-prisoners-1855-1947",
    "@type": "ArchiveOrganization",
    "name": "Register of Male and Female Prisoners (1855-1947). Public Record Office of Victoria."
  });

function getPlace(name) {
    if (!places[name]) {
        places[name] = {
            "@id": `#place_${name}`,
            "@type": "Place",
            "name": name
        }
        crate.addItem(places[name]);

    }
    return places[name];
}

main();

function findFiles(dataDir, files) {
    for (let f of fs.readdirSync(dataDir)) {
        var p = path.join(dataDir, f)
        stats = fs.lstatSync(p);
       if (stats.isDirectory()) {
            findFiles(p, files)
        }
        files[f.replace(/\..*$/, "")] = p;
        files[f.replace(/_0+/g, "_").replace(/\..*$/, "")] = p;
        
        
    }
}

async function main() {
    if (program.places) {
        loadPlaces(program.places)
    }
    const dataDir = program.data;
    var fileMap = {};
    if (dataDir) {
        findFiles(dataDir, fileMap);
    }
   //console.log(fileMap);
  
    var workbook = XLSX.readFile(program.spreadsheet);
    const data = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);
    //console.log(data);
    var count = 0;
    for (let row of data) {
        //console.log(Object.keys(row));
        const names = row["Name (and aliases)"]
                          .split(/;\s*/)
        //console.log(names);
        var birthplace = getPlace(row.Birthplace);
        const mainName = names.shift();
        var person = {
            "@id": `#person${row["Image ID"].padStart(22, "_")}`,
            "@type": "Person",
            "name": mainName,
            "alternateName": names.map((n)=>{return n.replace(/^./,"").replace(/.$/, "")}),
            "birthDate": row["Birth year"].toString(),
            "birthPlace": {"@id": birthplace["@id"]},
            "religion": row["Religion"],
            "education": row["Education"],
            "conviction": []
                    };


        for (let c of row["Conviction History"].split(";")) {
            const conv = c.split(/,\s*/);
           
            convictionPlace = getPlace(conv[3]);
            //6 MONTHS, 2-NOV-1904, VAGRANCY, MELBOURNE PETTY SESSIONS;
            if(conv[1]){
                const date = conv[1].toString();
                const offenceName = conv[2] || "Unspecified Offence";
                offenceID = `#offence_${offenceName.replace(/\W/g, "_")}`;
                if (!crate.getItem(offenceID)) {
                    crate.addItem ({
                        "@type" : "Offence",
                        "@id": offenceID,
                        "name"  : offenceName
                    });
                }

                var action = {
                    "@id": `#conviction_${count++}`,
                    "@type": ["Sentence"],
                    "object": {"@id": person["@id"]},
                    "name": `${date} ${mainName}: ${conv[0]} ${conv[2]} ${convictionPlace.name}`,
                    "sentence" : conv[0],
                    "offence": {"@id": offenceID},
                    "startTime": date,
                    "location": {"@id": convictionPlace["@id"]}
                }
                crate.addItem(action);
                person.conviction.push({"@id": action["@id"]});
            }
        }
        var filename = row["Image ID"];
        if (fileMap[filename]) {
            fileNameWithExt = path.basename(fileMap[filename]);
            const targetPath = path.join(destDir, fileNameWithExt);
            if (!fs.existsSync(targetPath)){
             //console.log("Copying", targetPath);
             fs.copyFileSync(fileMap[filename], targetPath);
             }
             filename = fileNameWithExt;
        } else {
            console.log("Not found", filename);
        }
        var file = {
            "name": `${mainName}: record`,
            "@id": `${filename}`,
            "@type": ["File", "ArchiveComponent"],
            "holdingArchive": {"@id": "https://prov.vic.gov.au/explore-collection/explore-topic/justice-crime-and-law/register-male-and-female-prisoners-1855-1947"},
            "about": {"@id": person["@id"]}
        };
        person.hasFile = {"@id": file["@id"]}
        crate.addItem(person);
        crate.addItem(file);
        //root.hasMember.push({"@id": person["@id"]});

        
    }

    fs.writeFileSync(path.join(destDir, "ro-crate-metadata.json"), JSON.stringify(crate.json_ld, null, 2));
  
    //console.log("Conviction", conviction);
}



