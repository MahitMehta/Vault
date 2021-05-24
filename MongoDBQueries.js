'use-strict'
const InitModel = require('./DirectoryModel');
const UserModel = require('./UserModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class MongoDBQueries {
    createUser(email, pass, folderName, bucket, userId, latestIssue, cb) {
        try {
            const userExists = UserModel.findUser(email);
            userExists.then(exists => {
                if (exists) {
                    cb({ success: false, code: "USER-EXISTS" });
                    return; 
                }   
                const res = UserModel.createUser(email, pass, folderName, bucket, userId, latestIssue);
                res.then(response => {
                    if (response.length) cb({ success: true });
                    else cb({ success: false });
                }).catch(err => {
                    console.log(err);
                    cb({ success: false });
                });
            }).catch(() => {
                cb({ success: false });
            });
        } catch (err) {
            cb({ success: false });
        }
    }

    updateLatestIssue(email, currentIssue) {
        const response = UserModel.updateLatestIssue(email, currentIssue);
        return response;
    }

    logoutUser(email, token, cb) {
        const data = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN);
        if (data.currentAdmin != email) {
            cb(false);
            return; 
        }

        let currentIssue = data.expire;
        currentIssue++;

        const response = UserModel.updateLatestIssue(email, currentIssue);
        response.then(_ => {
            cb(true);
        }).catch(_ => {
            cb(false);
        })
    }

    validateToken(token, baseDirectory, cb) {
        try {
            const { currentAdmin, currentAdminFolder, expire } = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN);
            const response = UserModel.getUser(currentAdmin);
            response.then(res => {
                const latestIssue = res.latestIssue; 
                const now = Date.now();
                if (expire >= latestIssue && currentAdminFolder == baseDirectory && expire > now) cb(true);
                else cb(false);
            }).catch(err => {
                console.log(err);
                cb(false);
            })
        } catch (err) {
            console.log(err);
            cb(false);
        }
    }   

    validateUser(email, pass) {
        try {
            const response = UserModel.validateUser(email, pass);
            return response; 
        } catch (err) {
            console.log(err);
        }
    }

    setDirectory(userId, parentPath, dirPath) {
        try {
            const DirectoryModel = InitModel(userId);
            DirectoryModel.createDirectoryDocument(parentPath, dirPath);
        }
        catch (err) {
            console.log(err);
            return;
        }
    }

    getDirectory(userId, path) {
        try {
            const DirectoryModel = InitModel(userId);
            return DirectoryModel.getDirectoryDocuments(path);
        }
        catch (err) {
            console.log(err);
            return [];
        }
    }
}

module.exports = MongoDBQueries;