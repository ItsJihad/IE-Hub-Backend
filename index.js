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

async function run() {
  try {
    await client.connect();

    const IEdb = client.db("IEdb");
    const IEcol = IEdb.collection("AllProducts");

    app.get("/", (req, res) => {
      res.send("Server is up and running at : ", port);
    });

    app.post("/products", async (req, res) => {
      const productDetails = req.body;
      console.log("hitting the post");

      const result = await IEcol.insertOne(productDetails);
      res.send(result);
    });

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
