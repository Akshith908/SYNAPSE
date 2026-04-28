const { MongoClient } = require("mongodb");
const { loadSampleData } = require("./sample-data");

const DEFAULT_URI = "mongodb://127.0.0.1:27017";
const DEFAULT_DB = "synapse";

let client;

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || DEFAULT_URI;
  const dbName = process.env.MONGODB_DB || DEFAULT_DB;

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }

  return client.db(dbName);
}

async function ensureSeeded(db) {
  const regionCount = await db.collection("regions").countDocuments();

  if (regionCount > 0) {
    return;
  }

  const data = loadSampleData();
  const networks = Object.entries(data.NETWORKS).map(([id, network]) => ({
    _id: Number(id),
    ...network
  }));
  const diseases = Object.entries(data.DISEASE_PROFILES).map(([name, profile]) => ({
    _id: name,
    ...profile
  }));
  const pathways = Object.entries(data.SAMPLE_PATHS).map(([key, nodes]) => {
    const [source, target] = key.split(":");

    return {
      _id: key,
      source,
      target,
      nodes
    };
  });

  await db.collection("networks").insertMany(networks);
  await db.collection("regions").insertMany(data.REGION_BLUEPRINTS);
  await db.collection("diseaseProfiles").insertMany(diseases);
  await db.collection("pathways").insertMany(pathways);
  await db.collection("simulationSnapshots").createIndex({ createdAt: -1 });
}

async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
  }
}

module.exports = {
  closeDatabase,
  connectToDatabase,
  ensureSeeded
};
