const express = require('express');
const router = express.Router();
const MongoModels = require("mongo-models");
const fs = require('fs');
const path = require('path');

const BucketIO = require('../AWSBucketQueries');
const MongoDBQueries = require('../MongoDBQueries');

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


require('dotenv').config();

router.post("/setObjectPublic", async (req, res) => {
    const body = req.query; 
    const { userId, fname, baseDirectory, directory } = body; 

    if (!userId || !fname || !baseDirectory || !directory) {   
        res.status(400).json({ success: false });
    }

    const absoluteDirectory = `${baseDirectory}/${directory}`;

    const connection = {
        uri: `mongodb+srv://${process.env.MONGODB_ADMIN_USERNAME}:${process.env.MONGODB_ADMIN_PASS}@vault.u5blu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
        db: 'public'
    };

    await MongoModels.connect(connection, { useUnifiedTopology: true });

    const response = await new MongoDBQueries().setObjectPublic(userId, fname, absoluteDirectory);

    const url = `/public/getPublicObject/${userId}?id=${response.id}&fname=${fname}`;

    if (response.data.length) {
        res.status(200).json({ success: true, url });;
    } else {
        res.status(500).json({ success: false });
    }

    MongoModels.disconnect();
});

router.get("/getPublicObject", async (req, res) => {
    let { userId, fileId, download, fname } = req.query; 
    if (!userId || !fileId || fileId === 'undefined' || !fname) {
        res.send("Invalid File");
        return; 
    }

    download = download === "true";

    const connection = {
        uri: `mongodb+srv://${process.env.MONGODB_ADMIN_USERNAME}:${process.env.MONGODB_ADMIN_PASS}@vault.u5blu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
        db: 'public'
    };

    await MongoModels.connect(connection, { useUnifiedTopology: true });

    const fnameBuff = new Buffer.from(fname, 'ascii');
    const fnameEncoded = fnameBuff.toString('base64');
    const fileNameSplit = fname.split('.');
    const extension = fileNameSplit.length ? fileNameSplit[fileNameSplit.length - 1] : "";
    const filePathTemp = `./temp/${fnameEncoded}.${extension}`;

    const bucketIO = new BucketIO(s3);
    bucketIO.loadPublicFile(userId, fileId, ({ error, body }) => {
        if (error) res.send("Invalid File");

        fs.writeFile(filePathTemp, body, () => {
            if (download) {
                res.download(path.join(__dirname, `../temp/${fnameEncoded}.${extension}`), fname);
            } else {
                res.sendFile(path.join(__dirname, `../temp/${fnameEncoded}.${extension}`));
            }
            
            res.on('finish', () => {
                fs.unlink(path.join(__dirname, `../temp/${fnameEncoded}.${extension}`), () => {
                  // Pass
                });
                MongoModels.disconnect();
            });
        });
    });
});

module.exports = router; 