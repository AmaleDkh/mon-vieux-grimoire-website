const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const dbUser = process.env.MONGODB_USER;
const dbPassword = process.env.MONGODB_PASSWORD;
const dbPath = process.env.MONGODB_PATH;
const dbName = process.env.MONGODB_NAME;
const dbCluster = process.env.MONGODB_CLUSTER;

const database = () => {
  mongoose
    .connect(
      `mongodb+srv://${dbUser}:${dbPassword}@${dbPath}/${dbName}?retryWrites=true&w=majority&appName=${dbCluster}`
    )
    .then(() => console.log("Connexion à MongoDB réussie"))
    .catch(() => console.log("Connexion à MongoDB échouée"));
};

module.exports = database;
