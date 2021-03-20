'use strict';
let { totalmem, freemem, hostname } = require('os');
let events = require('events');
let moment = require('moment');
let sqlite3 = require('sqlite3').verbose();
let config = require('./config.js');

let eventEmitter = new events.EventEmitter();
let db;

let connect = () => {
    db = new sqlite3.Database(config.DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log(`Connected to the ${config.DB_PATH} database.`);
    });
};

let disconnect = () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
};

let addMetric = () => {
    let fecha = moment().format('YYYY/MM/DD');
    let hora = moment().format('HH:mm:ss');
    let usageMemory = totalmem() - freemem();

    let sql = `INSERT INTO METRICAS (hostname, totalMemory, usageMemory, freeMemory, fecha, hora) VALUES (?,?,?,?,?,?)`
    let params =  [hostname(), totalmem(), usageMemory, freemem(), fecha, hora] 

    db.all(sql, params ,(err) => {
        if (err) throw err.message;
        //console.log(`insertando filas`);
    });
};

let removeMetric = () => console.log('removeMetric');

eventEmitter.addListener('connect', connect);
eventEmitter.addListener('disconnect', disconnect);
eventEmitter.addListener('addMetric', addMetric);
eventEmitter.addListener('removeMetric', removeMetric);

eventEmitter.emit('connect');

let interval = setInterval(() => {
    eventEmitter.emit('addMetric');
}, 1000);

let handler = setTimeout(() => {
    clearInterval(interval);
}, eventEmitter.emit('disconnect') , config.MIN_DISCONNECT * 1000 * 60);


