# criminal-characters

This repository contains tools for managing research data for Dr Alana Piper's [Criminal Characters](http://criminalcharacters.com) project.

This is a nodejs project for managing the criminal characters data as an [Arkisto](https://arkisto-platform.github.io/) data pipeline. It has instructions on how to:

- Install a set of tools for working with the data 
- Generate a single, archive-ready [RO-Crate](https://arkisto-platform.github.io/standards/ro-crate/) which contains:
   -  a JSON-LD representation of the data that can be used for analysis, eg by extracting GeoJSON feature collections for analysis
   -  a self-contained, future-proof HTML website that can be used to explore the data
-  Build an Oni web discovery portal that gives access to the data
-  Extract GeoJSON feature collections for further analysis


## Installation

The following installation instructions have been tested on Macos and assume you are installing in the `~/working` directory, adapt paths given below as necessary if not.

## Get the code

Type:

```
git clone git@github.com:Arkisto-Platform/criminal-characters.git ~/working
cd ~/working/criminal-characters
```


### Install this library

npm install .


## Data

The data for this project have been collected by Alana Piper - there are circa 50,000 prison records which have been digitized and transcribed. As of December 2000 this project has been set up to use a sample of the data with ~2000 records of women prisoners. A very small (2 record) test data set is included in this repository along with a spreadsheet that lists the location of the courts.

TODO: more details here about the digitization process and the crowd-sourced transcription.

To get the data type:

TODO: Simon Kruik will create an npm script to fetch the data so one can type `npm fetch sample` (and eventually, when the full dataset is avaiable `npm fetch all`).

This command will fetch a directory containing a number of PDF files and a spreadsheet that describes them.

```
- ConvictionsSample - /
                      / SampleDataPrisonRecords.xlsx 
                      / VICFP_18551934_000001_515.pdf
                      / ...
                      / VICFP_18551934_000014_062.pdf


```


### RO-Crate

The data are modeled as a single RO-Crate with RO-Crate Data Entities for the archival records.


### Vocabularies / ontologies

This project uses Schema.org as the base vocabulary with a few additions where coverage is not adequate in that vocabulary.

| Class / Property| Term                     | Note  
|------|--------------------|-----------------------------------------|
| Person      | http://schema.org/Person | Exact match                     |
| Court       | http://schema.org/Organization |  Courts are modeled as organizations with a `location` property linking to a `http://schema.org/Place` with `startDate` and `endDate` properties for those courts that have moved, as the Institution may have been located in different places at different times. |
| conviction | http://criminalcharacters.com/vocab/convition | The conviction property on a Person links to a Sentence |
| Offence / offence | http://criminalcharacters.com/vocab/#Offence / http://criminalcharacters.com/vocab/#offence| There is no obvious way to model the intangible offence (property) and Offence (class) using Schema.org and no obvious candidate for a criminological ontology so we defined our own terms |
| Sentence / sentence |  https://criminalcharacters.com/vocab/#Sentence / https://criminalcharacters.com/vocab/#sentence | Another Class/Property pair to model the a court sentence - we considered doing this with schema.org Action which is could be a subclass of a Person can a sentence property linking to one or more Sentence items which in turn have an offence property linking to an Offence |

See instructions below for how to generate an HTML fragment to host on https://criminalcharacters.com/vocab (via Alana Piper).


## How to work with the test data

The script [index.js] converts the spreadsheet format used by Alana Piper into an RO-Crate.

For usage type:
```
node index.js --help
```

```
   Usage: index [options] <crateDir>

  Extracts data from a spreadsheet to make an RO crate

  Options:

    -V, --version                       output the version number
    -a, --additional-context [context]  JSON file with context object
    -p, --places [places]               Spreadsheet of places (courts)
    -d, --data [data]                   Data directory from which to copy image files
    -s, --spreadsheet [spreadsheet]     Data about the people, convictions etc
    -h, --help                          output usage information

```
### Create an RO-Crate and HTML

- Type:
    ```
    npm run small
    ```

This command will:
-  Run `index.js` on the small sample data set.
   ``` 
    node index.js -a additional-context.json   -p CourtsCoordinates.xlsx  -d SampleData/ -s SampleData/SampleDataPrisonRecords.xlsx small-crate
   ```
   Explanation:
   `-a additional-context.json` defines additional classes and properties for the this data beyond what is in Schema.org and RO-Crate
   `-p CourtsCoordinates.xlsx` has the courts in Victoria and their locations over time
   `-d SampleData` is the directory containing the input data
   `-s SampleData/SampleDataPrisonRecords.xlsx` - an abridged version of the data about each prisoner

- Generate a multi-page HTML web site summarizing the data using rocstatic.
    ```
    rocstatic -c config/convictions.config.json small-crate/
    ```

    Explanation:
    `-c config/convictions.config.json` loads  [convictions.config.json](./convictions.config.json) which specifies:

    -  How to build navigation via collections attached to the root dataset:

       ``` "collectionTypes": ["Organization", "Offence", "Person"]```
   
    - Which types for which to build separate HTML pages - in this case the same set, specified via the key `types` in the configuration file. Each item with that `@type` gets a page.

    - How to 'prune' the large RO-Crate down to just items directly related to each of the items that gets its own page in the website.

    For example for a `Person` page this:
    ```
    "resolveAll": [
                [{"property": "about", "@reverse": true}, {"property": "holdingArchive"}],
                [{"property": "birthPlace"}],
                [{"property": "conviction"}, {"property": "offence"}],
                [{"property": "conviction"}, {"property": "location"}, {"property": "location"}]
            ]},

    ```

   To explain the first of these statements:
   1. Find all items that that refer back to this `Person` item using the `about` property (which finds the `ArchivalRecord` for this person, and from there, follow the `holdingArchive` )

   2. Follow the birthPlace property (which links to a Place)

   3. Follow the `conviction` property (to get `Sentence`s) and from each Sentence follow the `offence` property to get an `Offence`.

   4. Follow the `conviction` property (to get `Sentence`s) and from each Sentence follow the `location` property to an `Organization` (a court) and then to the court's geo location via the`location` property. 

   - Extract GeoJSON for each `@type` of interest, via scripts referenced in the config file via the `findPlaces` key. These have comments. Each returns GeoJSON. See [the geo script for Person](config/person-geo.js) 

- Generate a schema file in HTML format; for a member of the research team to post at https://criminalcharacters.com/vocab 
    ```
    node ./node_modules/ro-crate-html-js/roc-schema.js --html small-crate/ > vocab.html
    ```
   Creates `vocab.html` from the small crate.




## Set up an Oni portal

TODO - 

### Make an OCFL repository



## Extract GEO-JSON from the data




