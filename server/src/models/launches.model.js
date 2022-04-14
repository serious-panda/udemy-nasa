const axios = require('axios');

const launches = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
    console.log('Downloanding launches data');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1,
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Failed to download historical data');
        throw new Error('Failed to download spacex data');
    }
    const launchDocs = response.data.docs;
    for(const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });
        const newLaunch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            // target: 'Kepler-442 b',    // N/A
            customers: customers,
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success']
        }
        await saveLaunch(newLaunch);
    }
}

async function loadLaunchesData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });    
    if(firstLaunch){
        console.log('Launch data already loaded');
    } else {
        populateLaunches();
    }
}

async function findLaunch(filter) {    
    return await launches.findOne(filter);
}

async function getLatestFlightNumber() {
    const latestLaunch = await launches
        .findOne()
        .sort('-flightNumber');
    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    return await launches
        .find({}, {__v:0, _id:0})
        .skip(skip)
        .limit(limit)
        .sort('flightNumber');
}

async function saveLaunch(launch) {
    await launches.updateOne({
        flightNumber: launch.flightNumber
    },launch, {
        upsert: true,
    });
}

async function addNewLaunch(launch) {
    console.log(`looking up launch to ${launch.target}`);
    const planet = await planets.findOne({
        keplerName: launch.target,
    });
    if  ( !planet ) {
        throw new Error(`No matching planet found - ${launch.target}`);
    }
    const flightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = 
        Object.assign(launch, {
            flightNumber: flightNumber,
            success: true,
            upcoming: true,
            customers: ["ZTM", "NASA"],
        });
    await saveLaunch(launch);
}

async function abortLaunch(launchId) {
    return await launches.findOneAndUpdate({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,   
    }, {
        new: true,
    });
}


module.exports = {
    loadLaunchesData,
    addNewLaunch,
    getAllLaunches,
    abortLaunch,
}