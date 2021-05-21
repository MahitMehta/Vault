'use-strict'

const MongoModels = require('mongo-models');
const Joi = require('joi');

const schema = Joi.object({
    _id: Joi.object(),
    parentPath: Joi.string().required(),
    path: Joi.string().required(),
});


const initModel = (userCollectionId) => {
    class DirectoryModel extends MongoModels {
        static createDirectoryDocument(parentPath, path) {
            const document = new DirectoryModel({
                parentPath: parentPath,
                path: path,
            });
            return this.insertOne(document);
        }

        static getDirectoryDocuments(path) {
            const filter = { parentPath: path };
            return this.find(filter);
        }
    }
    
    DirectoryModel.collectionName = userCollectionId;
    DirectoryModel.schema = schema;

    return DirectoryModel; 
}

module.exports = initModel;