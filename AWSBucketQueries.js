const fs = require('fs')
require('dotenv').config();
const MongoDBQueries = require('./MongoDBQueries');

class BucketIO {
    constructor(dbObject) {
        this.dbObject = dbObject; 
        this.mongoDBQueries = new MongoDBQueries();
    }

    async loadPublicFile(userId, fileId, cb) {
        const absoluteDirectory = await this.mongoDBQueries.getPublicObjectDirectory(userId, fileId).catch(() => {
            cb({ error: true, body: ""});
            return; 
        });

        if (absoluteDirectory) this.retrieveFile(absoluteDirectory, cb);
    }

    createBucket(location="us-east-2") {
        const createBucketPromise = new Promise((resolve, reject) => {
            const params = {
                Bucket: process.env.AWS_DEFAULT_BUCKET,
                CreateBucketConfiguration: {
                    LocationConstraint: location
                }
            };
            
            this.dbObject.createBucket(params, function(err, data) {
                if (err) {
                    reject({ operationSuccess: false, code: err.code });
                }
                else {
                    // console.log('Bucket Created Successfully');
                    resolve({ operationSuccess: true, location: data.Location })
                }
            });
        })
        return createBucketPromise;
    }

    retrieveFile(filePath, cb) {
        const getParams = {
            Bucket: process.env.AWS_DEFAULT_BUCKET,
            Key: filePath,
        }

        this.dbObject.getObject(getParams, function (err, data) {
            if (err) {
                cb({ error: true, body: ""})
            } else {
                cb({ error: false, body: data.Body});
            }
        });
    }

    uploadFile(filePath, fileName, cb) {
        const filePathSplitted = filePath.split('/');
        const filePathNew = filePathSplitted.pop();
        const dirJoined = filePathSplitted.join('/');
        // console.log(dirJoined);
        const dirFormatted = dirJoined.split('-').join('/');
        // console.log(dirFormatted);
        let dirAdjusted = `${dirFormatted}/${filePathNew}`;
        dirAdjusted = dirAdjusted.replace(/\/\//g , '/');
        const fileContent = fs.readFileSync(fileName);
        // console.log("File Key: ", dirAdjusted);
        const params = {
            Bucket: process.env.AWS_DEFAULT_BUCKET,
            Key: dirAdjusted,
            Body: fileContent
        };
    
    
        this.dbObject.upload(params, (err, data) => {
            if (err) {
                cb(false);
            }
            cb(true);
        });
    }

    createFolder(name, userId, baseDirectory, directory, callback) {
        // console.log(directory, baseDirectory)
        const dirPath = `${baseDirectory}/${directory == "/" ? "" : directory}${name}/`;
        const dirPathAdjusted = dirPath.split('-').join('/');
        const pathSegmented = dirPathAdjusted.split('/');
        // onsole.log(dirPathAdjusted);
        pathSegmented.pop();
        pathSegmented.pop(); 
        this.mongoDBQueries.setDirectory(userId, pathSegmented.join("/") + "/",dirPathAdjusted);

        const params = { Bucket: process.env.AWS_DEFAULT_BUCKET, Key: dirPathAdjusted, Body: "" };
        this.dbObject.upload(params, (err) => {
            if (err) callback(false)
            else callback(true)
        })
    }

    listObject(directory, callback) {
        let s3DataContents = [];
        const directoryAdjusted = directory.replace("//", "/");
        // console.log(directoryAdjusted);

        const params = {
            Bucket: process.env.AWS_DEFAULT_BUCKET,
            Prefix: directoryAdjusted,
            Delimiter: "/"
        };

        const s3ListObjects = (params) => {
            this.dbObject.listObjects(params, function(err, data) {
                if (err) {
                    callback({ querySuccess: false, data: [] })
                } else {
                    const contents = data.Contents;
                    s3DataContents = s3DataContents.concat(contents);
                    if (data.IsTruncated) {
                        params.Marker = contents[contents.length-1].Key;
                        s3ListObjects(params);
                    } else {
                        callback({ querySuccess: true, data: s3DataContents });
                    }
                }
            });
        }

        s3ListObjects(params);
    }
}

module.exports = BucketIO; 

