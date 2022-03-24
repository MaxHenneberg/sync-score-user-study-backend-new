var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

const connectionProps = {
    host: 'schulhelfer.lima-db.de',
    user: process.env.US_DB_USER,
    password: process.env.US_DB_PASSWORD,
    database: process.env.US_DB_DATABASE
}

var connection = mysql.createConnection(connectionProps);
connection.connect();

/* GET users listing. */
router.post('/store', function (req, res, next) {
    console.log('test')
    const runId = generateRunId();
    const study = req.body.study;
    const syncScore = req.body.syncScore;
    console.log(`Received Post request for ${req.body.study}`);
    storeInDb({runId: runId, study: study, syncScore: syncScore});
    res.send('respond with a resource');
});
router.get('/test', (req, res) => {
    res.send('Test worked')
});

function generateRunId() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var timeStamp = date + '_' + time;
    var randomNumber = Math.floor(Math.random() * 10000);
    return timeStamp + '_' + randomNumber;
}

function storeInDb(objectToBeStored) {
    queryString = `INSERT INTO SyncScore (RUN_ID, STUDY, SYNC_SCORE)
                   VALUES ("${objectToBeStored.runId}", ${objectToBeStored.study}, "${objectToBeStored.syncScore}");`
    connection.query(queryString, (error, results, fields) => {
        if (error) {
            console.error(error);
            throw error;
        } else {
            console.log(results);
        }
    })
}

module.exports = router;
