'use-strict'

const Joi = require('joi');
const MongoModels = require('mongo-models');
require('dotenv').config();

const schema = Joi.object({
    _id: Joi.object(),
    email: Joi.string().required(),
    pass: Joi.string().required(),
    folderName: Joi.string().required(),
    bucket: Joi.string().required(),
    userId: Joi.string().required(),
    latestIssue: Joi.number().required(),
    loggedIn: Joi.boolean().required(),
});

class UserModel extends MongoModels {   
    static createUser(email, pass, folderName, bucket, userId, latestIssue, loggedIn) {
        const document = new UserModel({
            email: email,
            pass: pass,
            folderName: folderName,
            bucket: bucket,
            userId: userId,
            latestIssue: latestIssue,
            loggedIn: loggedIn,
        });
        return this.insertOne(document);
    }

    static updateLatestIssue(email, currentIssue) {
        const filter = { email: email }
        return this.updateOne(filter, { $set: {latestIssue: currentIssue}});
    }

    static validateUser(email, pass) {
        const query = { email: email, pass: pass }; 
        return this.findOne(query);
    }

    static getUser(email) {
        const query = { email: email };
        return this.findOne(query);
    }
}

UserModel.collectionName = process.env.MONGODB_USER_COLLECTION;
UserModel.schema = schema; 

module.exports = UserModel; 