require("dotenv").config();
const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());
app.use(express.json());

const port = 3000;

const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.xiyzyju.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const admin = require("firebase-admin");

const serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// -------------------------------------------------------
const AuthVerification = async (req, res, next) => {
  const AuthToken = req.headers.authorization;

  if (!AuthToken) {
    res.status(401).send({ message: "unauthorized" });
  }
  const token = AuthToken.split(" ")[1];

  try {
    await admin.auth().verifyIdToken(token);
    next();
  } catch (err) {
    return res.status(401).send({ message: "unauthorized" });
  }
};

async function run() {
  try {
    await client.connect();

    const IEdb = client.db("IEdb");
    const IEcol = IEdb.collection("AllProducts");
    // ------------------------------------------------------------
    app.get("/", AuthVerification, async (req, res) => {
      const cursor = IEcol.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // ----------------------------------------------------------
    app.post("/products", AuthVerification, async (req, res) => {
      const productDetails = req.body;
      console.log("hitting the post");

      const result = await IEcol.insertOne(productDetails);
      res.send(result);
    });
    // -------------------------------------------------------------
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    app.listen(port, () => {
      console.log("server is up at : ", port);
    });
  }
}
run().catch(console.dir);
