const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.xiyzyju.mongodb.net/?appName=Cluster0;`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());

async function run() {
  try {
    await client.connect();

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    app.listen(port, () => {
      console.log("listening at", port);
    });
  }
}
run().catch(console.dir);
