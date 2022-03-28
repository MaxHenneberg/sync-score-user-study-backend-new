const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

AWS.config.region = process.env.REGION

const sns = new AWS.SNS();
const ddb = new AWS.DynamoDB();

const snsTopic = process.env.TOPIC_USER_STUDY;
const TABLE_SYNC_SCORE = process.env.TABLE_SYNC_SCORE;
console.log(`SyncScoreTable: ${TABLE_SYNC_SCORE}`)

/* GET users listing. */
router.post('/store', function (req, res, next) {
    console.log(`Received Post request for ${req.body.study}`);
    storeInDb(req.body);
    res.send('respond with a resource');
});
router.get('/test', (req, res) => {
    res.send('UserData worked')
});

function storeInDb(objectToBeStored) {
    const item = {
        'id': {'S': `${generatePartitionKey()}`},
        'runId': {'S': `${objectToBeStored.runId}`},
        'study': {'S': `${objectToBeStored.study}`},
        'syncScore': {'S': objectToBeStored.syncScore}
    };
    console.log(`Item: ${JSON.stringify(item)}`)
    ddb.putItem({
        'TableName': TABLE_SYNC_SCORE,
        'Item': item
    }, (err, data) => {
        const message = formatMessage(objectToBeStored);
        if (err) {
            console.log(err);
            sns.publish({
                'Message': JSON.stringify(err),
                'Subject': 'ERROR: Storing new UserStudy',
                'TopicArn': snsTopic
            }, function (err, data) {
                if (err) {
                    console.log('SNS Error: ' + err);
                } else {
                    console.log(`New Message published: ${message}`);
                }
            });
        } else {
            console.log('User Study stored');
            sns.publish({
                'Message': message,
                'Subject': 'SUCCESS: New User Study Stored',
                'TopicArn': snsTopic
            }, function (err, data) {
                if (err) {
                    console.log('SNS Error: ' + err);
                } else {
                    console.log(`New Message published: ${message}`);
                }
            });
        }
    })
}

function formatMessage(body) {
    return `Received new UserStudy :${JSON.stringify(body)}`;
}

function generatePartitionKey() {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const timeStamp = date + '_' + time;
    const randomNumber = Math.floor(Math.random() * 10000);
    return 'ID_' + timeStamp + '_' + randomNumber;
}

module.exports = router;
