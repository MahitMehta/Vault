const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const connectClient = () => {
    const uri = `mongodb+srv://${process.env.MONGODB_ADMIN_USERNAME}:${process.env.MONGODB_ADMIN_PASS}@vault.u5blu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    return client; 
}

module.exports = connectClient(); 

