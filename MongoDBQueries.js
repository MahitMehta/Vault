'use-strict'
const InitModel = require('./DirectoryModel');
const UserModel = require('./UserModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class MongoDBQueries {

    createUser(email, pass, folderName, bucket, userId, latestIssue, loggedIn) {
        try {
            const response = UserModel.createUser(email, pass, folderName, bucket, userId, latestIssue, loggedIn);
            return response; 
        } catch (err) {
            console.log(err);
        }
    }

    updateLatestIssue(email, currentIssue) {
        const response = UserModel.updateLatestIssue(email, currentIssue);
        return response; 
    }

    validateToken(token, baseDirectory, cb) {
        try {
            const { currentAdmin, currentAdminFolder, expire } = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN);
            const response = UserModel.getUser(currentAdmin);
            response.then(res => {
                const latestIssue = res.latestIssue; 
                if (expire >= latestIssue && currentAdminFolder == baseDirectory) cb(true);
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

    createUser(email, pass) {
        const validate = async () => {
            // const UserModelOBJ = new UserModel({
            //     email: 'edjled',
            //     pass: 'dejdh',
            //     folderName:'dedled',
            //     bucket: 'ded',
            //     userId:'ed',
            //     latestIssue: 1,
            // });
            // const query = { email: "mahit.py@gmail.com" };
            // UserModelOBJ
        }
        validate();
    }
}

module.exports = MongoDBQueries;

// const validUser = (email, pass) => {
//     client.connect()
//     .then(() => {
//         const collection = client.db("vault_users").collection("users");
//         console.log("Success");
//         client.close();
//     })
//     .catch((err) => {
//         console.log("error");
//         client.close();
//     });
//     return true;
// }
