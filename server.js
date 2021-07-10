const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 5000;
const MongoModels = require('mongo-models');
const fs = require('fs');

const MongoDBQueries = require('./MongoDBQueries');
const mongoDBQueries = new MongoDBQueries();

const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const awsRoutes = require('./routes/awsRoutes');
const publicRoutes = require("./routes/publicRoutes");

const busboy = require('connect-busboy');

require('dotenv').config();


app.use(cookieParser());
app.use(express.json());
app.use(busboy()); 

const validateRequest = (req, res, next) => {
    const validHostsWhitelist = [`http://localhost:${PORT}`, "https://mahitvault.herokuapp.com/"];
    const host = req.headers.host;
    const hostValid = validHostsWhitelist.some(hostName => hostName.includes(host))
    if (!hostValid) {
        res.status(403).send("Forbidden")
    }

    const userAgent = req.headers['user-agent'];
    if (!userAgent || userAgent.startsWith("curl/")) {
        res.status(403).send("Nice Try...But You Failed!");
    }

    next();
}

const validateToken = (req, res, next) => { 
    const token = req.query.token; 
    const baseDirectory = req.query.baseDirectory; 

    if (!token) { 
        res.status(403).send("Forbidden");
        return; 
    }
    mongoDBQueries.validateToken(token, baseDirectory, success => {
        if (!success) res.status(403).send("Forbidden");
        else next();
    });
}

const connection = {
    uri: `mongodb+srv://${process.env.MONGODB_ADMIN_USERNAME}:${process.env.MONGODB_ADMIN_PASS}@vault.u5blu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    db: 'vault'
};

app.use(validateRequest);
app.use('/api/aws', validateToken);
app.use('/api/auth/logoutAdmin', validateToken);

app.use('/api/auth', authRoutes);
app.use('/api/aws', awsRoutes);

app.use('/api/public/setObjectPublic', validateToken);
app.use('/api/public', publicRoutes);

app.use(express.static(path.join(__dirname, 'client/build')))

app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

async function main() {
    const tempDir = path.join(__dirname, 'temp/');
    if (!fs.existsSync(tempDir))
        fs.mkdirSync(tempDir);


    await MongoModels.connect(connection, { useUnifiedTopology: true });
    app.listen(PORT);
    console.log(`Listening on Port:${PORT}`);
}

main();
