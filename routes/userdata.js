const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

AWS.config.region = process.env.REGION

const sns = new AWS.SNS();
const ddb = new AWS.DynamoDB();

const snsTopic =  process.env.TOPIC_USER_STUDY;
const TABLE_USER_DATA = process.env.TABLE_USER_DATA;
console.log(`UserDataTable: ${TABLE_USER_DATA}`)

/* GET users listing. */
router.post('/store', function (req, res, next) {
    console.log(`Received UserData for ${req.body.runId}`);
    storeInDb(req.body);
    res.send('respond with a resource');
});
router.get('/test', (req, res) => {
    res.send('UserStudy worked')
});

function storeInDb(objectToBeStored) {
    const item = {
        'runId': {'S': `${objectToBeStored.runId}`},
        'age': {'N': `${objectToBeStored.age}`},
        'gender': {'S': objectToBeStored.gender},
        'countryLiving': {'S': objectToBeStored.countryLiving},
        'countryGrownUp': {'S': objectToBeStored.countryGrownUp},
        'education': {'S': objectToBeStored.education}
    };
    console.log(`Item: ${JSON.stringify(item)}`)
    ddb.putItem({
        'TableName': TABLE_USER_DATA,
        'Item': item
    }, (err, data) => {
        const message = formatMessage(objectToBeStored);
        if (err) {
            console.log(err);
            sns.publish({
                'Message': JSON.stringify(err),
                'Subject': 'ERROR: Storing new UserData',
                'TopicArn': snsTopic
            }, function (err, data) {
                if (err) {
                    console.log('SNS Error: ' + err);
                } else {
                    console.log(`New Message published: ${message}`);
                }
            });
        }else{
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

function formatMessage(body){
    return `Received UserData:\n ${JSON.stringify(body)}`
}

module.exports = router;
