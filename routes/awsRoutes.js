const express = require('express');
const Router = express.Router();
const fs = require('fs');
const MongoDBQueries = require('../queries/MongoDBQueries');
const mongoDBQueries = new MongoDBQueries();
const path = require('path');
const MongoModels = require("mongo-models");

const BucketIO = require('../queries/AWSBucketQueries');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


const bucketIO = new BucketIO(dbObject=s3);
Router.use(express.static(path.join(__dirname, '../temp')));

Router.get('/getFile/:fileName', (req, res) => {
    let requestDirectory = req.query.directory;
    const baseDirectory = req.query.baseDirectory;
    const download = req.query.download;
    const fname = req.query.fname; 
    console.log("getting!");

    if (!requestDirectory || !fname) res.status(400).send("Forbidden");
    const buff = new Buffer.from(req.query.fname, "ascii"); 
    const fnameEncoded = buff.toString("base64"); 
    requestDirectory = requestDirectory.split('-')
    requestDirectory = requestDirectory.join('/');
    requestDirectory = requestDirectory.replace('BASE', '');
    const directory = `${baseDirectory}/${requestDirectory}`;
    const filePath = directory + fname; 
    const fileNameSplit = fname.split('.');
    const extension = fileNameSplit.length ? fileNameSplit[fileNameSplit.length - 1] : "";
    const filePathTemp = `./temp/${fnameEncoded}.${extension}`;
    const fileSent = new Promise((resolve, reject) => {
        bucketIO.retrieveFile(filePath, ({error, body}) => {
            if (error) {
                reject();
                return; 
            };
            fs.writeFile(filePathTemp, body, () => {
                if (download == "true") {
                    res.download(path.join(__dirname, `../temp/${fnameEncoded}.${extension}`), fname);
                } else {
                    res.sendFile(path.join(__dirname, `../temp/${fnameEncoded}.${extension}`));
                }
                
                res.on('finish', () => {
                    resolve();
                });
            });
        });
    });

    fileSent.then(() => {
        fs.unlink(path.join(__dirname, "../temp", `${fnameEncoded}.${extension}`), () => {
            // File Deleted!
        });
    }).catch(() => {
        res.status(500);
    })
});

Router.post('/createBucket', (req, res) => {
    const { name, location } = req.body; 

    if (!name || !location) res.status(400).json({ operationSuccess: false })
    bucketIO.createBucket(name, location)
    .then(response => {
        res.json(response);
    })
    .catch(err => {
        res.json(err);
    })
});

Router.post('/createFolder', (req, res) => {
    const { name, userId } = req.body; 
    const { baseDirectory, directory } = req.query; 
    requestDirectory = directory; 
    requestDirectory = requestDirectory.replace('-', '/');
    requestDirectory = requestDirectory.replace('BASE', '');

    if (!name) res.status(400).json({ operationSuccess: false })
    bucketIO.createFolder(name, userId, baseDirectory, requestDirectory, success => {

        res.status(success ? 200 : 500).json({ operationSuccess: success });
    });
});

Router.get('/getAllFolders', (req, res) => {
    let requestDirectory = req.query.directory;
    const baseDirectory = req.query.baseDirectory;

    if (!requestDirectory || !baseDirectory) res.status(400).json({ querySuccess: false });
    const buff = new Buffer.from(req.query.userId, 'base64');
    const userId = buff.toString('ascii')
    // console.log(requestDirectory, baseDirectory);
    const dirPath = `${baseDirectory}/${requestDirectory == "/" ? "" : requestDirectory}/`;
    const pathSegmented = dirPath.split('/');
    pathSegmented.pop();
    pathSegmented.pop(); 
    // console.log(pathSegmented.join("/") + "/");

    requestDirectory = requestDirectory.replace('-', '/');
    requestDirectory = requestDirectory.replace('BASE', '');
    const directory = `${baseDirectory}/${requestDirectory == "/" ? "" : requestDirectory}`;
    const directoryAdjusted = directory.split('-').join("/");
    
    const response = mongoDBQueries.getDirectory(userId, directoryAdjusted);
    response.then(data => {
        resData = data.length ? data.map((dir) => dir.path) : [];
        res.status(200).json({ directories: resData });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ directories: [] });
    })
})

Router.get('/getAllFiles', (req, res) => {
    let requestDirectory = req.query.directory;
    const baseDirectory = req.query.baseDirectory;
    const userId = req.query.userId;

    if (!requestDirectory || !baseDirectory || !userId) res.status(400).json({ querySuccess: false, data: [] })
    requestDirectory = requestDirectory.split('-')
    requestDirectory = requestDirectory.join('/');
    requestDirectory = requestDirectory.replace('BASE', '');
    requestDirectory = requestDirectory.substring(2);
    const directory = `${baseDirectory}/${requestDirectory}`;
// console.log(directory);
    bucketIO.listObject(directory, async (data) => {
        let dataResponse = data.data.length ? data.data.map(file => {
            return file.Key;
        }) : [];

        dataResponse = dataResponse.filter(data => {
            return data.match(/\.[A-z]+$/);
        });

        // const connection = {
        //     uri: `mongodb+srv://${process.env.MONGODB_ADMIN_USERNAME}:${process.env.MONGODB_ADMIN_PASS}@vault.u5blu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
        //     db: 'public'
        // };
        
        // await MongoModels.connect(connection, { useUnifiedTopology: true });

        // const publicFiles = await mongoDBQueries.getAllPublicFiles(userId, directory);
        // console.log(publicFiles);

        res.json({ querySuccess: true, data: dataResponse});
    });
});

Router.post('/uploadFiles', (req, res) => {
    const fname = req.query.fname;
    const baseDirectory = req.query.baseDirectory; 
    const directory = req.query.directory;
    const adjustedDir = directory == "BASE" ? "" : directory;
    let fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', async (_, file, filename) => {
        const fileNameAltered = fname ? fname : filename; 
        const path = './temp/' + fileNameAltered; 
        fstream = fs.createWriteStream(path);
        // console.log("writing file");
        file.pipe(fstream);
        fstream.on('close', () => {
            // console.log("uploading to aws..");
            bucketIO.uploadFile(`${baseDirectory}/${adjustedDir}${fileNameAltered}`, `./temp/${fileNameAltered}`, (success) => {
                res.status(200).send({ operationSuccess: success });
                res.on('finish', () => {
                    fs.unlink(path, () => {
                        return; 
                    });
                });
            });
            
        });
    });
}); 

module.exports = Router; 
