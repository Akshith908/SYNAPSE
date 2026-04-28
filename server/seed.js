require("dotenv").config();

const { closeDatabase, connectToDatabase, ensureSeeded } = require("./db");

async function main() {
  const db = await connectToDatabase();
  await db.collection("networks").deleteMany({});
  await db.collection("regions").deleteMany({});
  await db.collection("diseaseProfiles").deleteMany({});
  await db.collection("pathways").deleteMany({});
  await ensureSeeded(db);

  const [regions, diseases, pathways] = await Promise.all([
    db.collection("regions").countDocuments(),
    db.collection("diseaseProfiles").countDocuments(),
    db.collection("pathways").countDocuments()
  ]);

  console.log(`Seeded MongoDB database "${db.databaseName}"`);
  console.log(`regions=${regions}, diseaseProfiles=${diseases}, pathways=${pathways}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
