require("dotenv").config();
const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());
app.use(express.json());

const port = 3000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const decode = await admin.auth().verifyIdToken(token);

    req.token_email = decode.email;

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
    // --------------------------get all product at once----------------------------------
    app.get("/products", async (req, res) => {
      const cursor = IEcol.find();
      const result = await cursor.toArray();

      res.send(result);
    });
    //-----------------------------get a specific product with ID------------------------------------
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await IEcol.findOne(query);
      res.send(result);
    });

    // ---------------------------get recent 6 products-----------------------------------------
    app.get("/recentproducts", async (req, res) => {
      const cursor = IEcol.find().sort({ createdAt: 1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    // ---------------------------get recent 3 products-----------------------------------------
    app.get("/recent3", async (req, res) => {
      const cursor = IEcol.find().sort({ createdAt: -1 }).limit(3);
      const result = await cursor.toArray();
      res.send(result);
    });

    // --------------------------------POST API-------------------------------------------------------------------------------
    app.post("/products", AuthVerification, async (req, res) => {
      const productDetails = req.body;
      const result = await IEcol.insertOne(productDetails);
      console.log("hitting the post");
      res.send(result);
    });

    //------------------------------------get specific user Export ---------------------------
    app.get("/myexports", AuthVerification, async (req, res) => {
      const email = req.query.email;

      const DBquery = {};
      if (email) {
        DBquery.email = email;
      }
      const cursor = IEcol.find(DBquery);
      const result = await cursor.toArray();

      res.send(result);
    });

    // ---------------------------Ping the Server----------------------------------
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
