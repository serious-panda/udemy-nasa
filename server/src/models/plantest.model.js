const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

const planets = require('./planets.mongo');

function isHabitable(planet) {
    return planet['koi_disposition'] === 'CONFIRMED' && 
    planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6 ;
}

function loadPlanetsData(){
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', '/data/kepler_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true
        }))
        .on('data', async (data) => {
            if (isHabitable(data)){
                await savePlanet(data)
            }
        })
        .on('end', async () => {
            const planetsFound = (await getAllPlanets()).length;
            console.log(`done. found ${planetsFound}`);
            resolve();
        })
        .on('error', (err) =>{
            console.log(err);
            reject(err);
        });
    })
}

async function getAllPlanets() {
    return await planets.find({}, {_id:0, keplerName:1});
}

async function savePlanet(planet) {
    try {
        await planets.updateOne({
            keplerName: planet.kepler_name,
        }, {
            // keplerName: planet.kepler_name, 
            ...planet,
        }, {
            upsert: true,
        });
    
    } catch(err) {
        console.err(`Couldn't save planet. ${err}`);
    }
}

module.exports = {
    loadPlanetsData,
    getAllPlanets,
}
