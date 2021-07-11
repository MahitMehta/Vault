const MongoModels = require('mongo-models');
const Joi = require('joi');

schema = Joi.object({
    _id: Joi.object(),
    publicId: Joi.string().required(),
    fname: Joi.string().required(),
    directory: Joi.string().required(),
});

const initModel = collectionName => {
    class PublicModel extends MongoModels {
        static setObjectPublic(publicId, fname, directory) {
            const document = new PublicModel({
                publicId,
                fname,
                directory,
            });

            return this.insertOne(document);
        }

        static validateFileId(fileId) {
            const filter = { publicId: fileId };
            return this.findOne(filter);
        }

        static listAllPublicFiles(fileDirectory) {
            const filter = { directory: fileDirectory };
            return this.find(filter);
        }
    }
    
    PublicModel.schema = schema; 
    PublicModel.collectionName = collectionName;

    return PublicModel;
}

module.exports = initModel; 