const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');


const api = require('./routes/api');

const app = express();
app.use(helmet());

app.use(cors({
    origin: 'http://localhost:3000'
}));

function checkLoggedIn(req, res, next) {
    const isLoggedIn = true;
    if (!isLoggedIn){
        return res.status(400).json({
            error: 'You must log in.',
        });
    }
    next(); 
}

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/v1', checkLoggedIn, api);
app.get('/*', (req,res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"))
});

module.exports = app;