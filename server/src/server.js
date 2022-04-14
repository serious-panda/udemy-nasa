const fs = require('fs');
const https = require('https');
require('dotenv').config();

const app = require('./app');
const { loadPlanetsData } = require('./models/plantest.model');
const { loadLaunchesData } = require('./models/launches.model');
const { mongoConnect } = require('./services/mongo');

const PORT = process.env.PORT || 8000;

const server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
},app);

async function startServer(){
    await mongoConnect();    
    await loadPlanetsData();
    await loadLaunchesData();

    server.listen(PORT, ()=>{
        console.log(`listening on port ${PORT}...`);
    })
}

startServer();