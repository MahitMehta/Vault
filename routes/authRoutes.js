const express = require('express');
const Router = express.Router();
const jwt = require('jsonwebtoken');
const MongoDBQueries = require('../MongoDBQueries');
var cookie = require('cookie');

const mongoDBQueries = new MongoDBQueries();

Router.post("/logoutAdmin", (req, res) => {
    const { email } = req.body; 
    const token = req.query.token; 

    if (!email || !token) {
        res.status(400).send({ success: false });
        return; 
    }

    mongoDBQueries.logoutUser(email, token, success => {
        res.status(success ? 200 : 403).json({ success: success });
    });

});

Router.post('/loginAdmin', (req, res) => {
    const authorizationToken = req.headers.authorization;
    let buff = new Buffer.from(authorizationToken.split(/\s+/)[1], 'base64');
    let decodedToken = buff.toString('ascii');
    const [email, pass] = decodedToken.split(":");

   mongoDBQueries.validateUser(email, pass)
    .then(response => {
        if (response) {
            const validTime = (1000 * 60 * 15); // 15 minutes
            const latestIssue = Date.now() + validTime;  
            const payLoadToken = {
                currentAdminFolder: response.folderName,
                currentAdmin: response.email, 
                expire: latestIssue
            }

            // Should handle error if updating latest issue fails
            mongoDBQueries.updateLatestIssue(response.email, latestIssue)

            let payLoadUser = new Buffer.from(JSON.stringify({
                bucket: response.bucket,
                email: response.email,
                folderName: response.folderName,
                userId: response.userId,
            }));
            payLoadUser = payLoadUser.toString('base64');
            const token = jwt.sign(payLoadToken, process.env.ADMIN_ACCESS_TOKEN); 
            res.status(200).json({ access: true, user: payLoadUser, token: token });
        }
        else
            res.status(400).json({ access: false });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ access: false });
    })
});

Router.get('/validateLogin', (req, res) => {
    const token = req.query.token; 
    const baseDirectory = req.query.baseDirectory; 

    if (!token || !baseDirectory) res.status(403).send({ valid: false });
    mongoDBQueries.validateToken(token, baseDirectory, success => {
        res.status(success ? 200 : 403 ).json({ access: success });
    });
});

module.exports = Router; 

