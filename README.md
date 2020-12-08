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

The following installation instructions have been tested on Macos and assume you are installing in the `~/working` directory, adapt paths give below as necessary if not.

## Get the code

Type:

```
git clone git@github.com:Arkisto-Platform/criminal-characters.git ~/working
cd ~/working/criminal-characters
```


### Dependencies 
If you don't have it already, install the ro-crate-html tool repository.

npm install -g ro-crate-html

TODO: Can this be imported automatically when installing _this_ repo? Would that give us access to rocrate-static?

### Install this library

npm install .


## Data

The data for this project have been collected by Alana Piper - there are circa 50,000 prison records which have been digitized and transcribed. As of December 2000 this project has been set up to use a sample of the data with ~2000 records of women prisoners. A very small (2 record) test data set is included in this repository along with a spreadsheet that lists the location of the courts.

TODO: more details here about the digitization process and the crowd-sourced transcription.

To get the data type:

TODO: Simon Kruik will create an npm script to fetch the data so one can type `npm fetch sample` (and `eventually npm fetch all`).

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


## Make an RO-Crate and HTML website from the data

The script [index.js] converts the spreadsheet format used by Alana Piper into an RO-Cratenode

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
### Test data

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





## Set up an Oni portal


### Make an OCFL repository


## Extract GEO-JSON from the data


## Configuration

There are a number of configurable parts of this project:

1.  [How to provide browse access](./config/convictions.config.json) to the data in the crate via a series of collections (initially `Person`, `Offence` and `Organization` (Court)). 

2.  How to extract the place data relevant to [`Person`s]() `Organization`s and `Offence`s using a series of Javascript functions which return GeoJSON feature collections which are fed to a Leaflet map.

3. 

