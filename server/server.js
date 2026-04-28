require("dotenv").config();

const express = require("express");
const path = require("path");
const { connectToDatabase, ensureSeeded } = require("./db");

const app = express();
const port = Number(process.env.PORT || 3000);
const projectRoot = path.join(__dirname, "..");

let database;

app.use(express.json());
app.use(express.static(projectRoot));

app.get("/api/health", async (_request, response) => {
  response.json({
    ok: true,
    database: database?.databaseName || null
  });
});

app.get("/api/bootstrap", async (_request, response, next) => {
  try {
    const [networks, regions, diseaseProfiles, pathways] = await Promise.all([
      database.collection("networks").find({}).sort({ _id: 1 }).toArray(),
      database.collection("regions").find({}, { projection: { _id: 0 } }).toArray(),
      database.collection("diseaseProfiles").find({}).toArray(),
      database.collection("pathways").find({}).toArray()
    ]);

    response.json({
      source: "mongodb",
      NETWORKS: Object.fromEntries(networks.map(({ _id, ...network }) => [_id, network])),
      REGION_BLUEPRINTS: regions,
      DISEASE_PROFILES: Object.fromEntries(diseaseProfiles.map(({ _id, ...profile }) => [_id, profile])),
      SAMPLE_PATHS: Object.fromEntries(pathways.map((pathway) => [`${pathway.source}:${pathway.target}`, pathway.nodes]))
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/simulations", async (_request, response, next) => {
  try {
    const snapshots = await database
      .collection("simulationSnapshots")
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    response.json(snapshots);
  } catch (error) {
    next(error);
  }
});

app.post("/api/simulations", async (request, response, next) => {
  try {
    const snapshot = {
      createdAt: new Date(),
      disease: request.body.disease || "Healthy",
      label: request.body.label || null,
      selectedRegion: request.body.selectedRegion || null,
      activeCount: Number(request.body.activeCount || 0),
      lesionedCount: Number(request.body.lesionedCount || 0),
      metrics: request.body.metrics || {},
      config: request.body.config || null
    };

    const result = await database.collection("simulationSnapshots").insertOne(snapshot);
    response.status(201).json({
      _id: result.insertedId,
      ...snapshot
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    error: "Server error",
    message: error.message
  });
});

async function start() {
  database = await connectToDatabase();
  await ensureSeeded(database);

  app.listen(port, () => {
    console.log(`SYNAPSE running at http://localhost:${port}`);
    console.log(`MongoDB database: ${database.databaseName}`);
  });
}

start().catch((error) => {
  console.error("Failed to start SYNAPSE server");
  console.error(error);
  process.exit(1);
});
