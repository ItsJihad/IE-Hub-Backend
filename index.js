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
    const UserImports = IEdb.collection("UserImports");
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
      const quantity = Number(req.body.quantity);
      const price= Number(req.body.price)
      const rating= Number(req.body.rating)

      const TobeStored = {
        name: req.body.name,
        photourl: req.body.photourl,
        rating,
        price,
        origin: req.body.origin,
        email: req.body.email,
        quantity,
      };
      const result = await IEcol.insertOne(TobeStored);
      res.send(result);
    });

    //--------------------------------------------delete specific product by ID from Import---------------------
    app.delete("/myimports/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await UserImports.deleteOne(query);
      res.send(result);
    });

    //---------------------------------------------------------MYImports--------------------------------------------
    app.post("/myimports", AuthVerification, async (req, res) => {
      const productID = req.body.productID;
      const proID = { _id: new ObjectId(productID) };
      const quantity = Number(req.body.quantity);

      const TobeStored = {
        productID: proID,
        name: req.body.name,
        photourl: req.body.photourl,
        rating: req.body.rating,
        price: req.body.price,
        origin: req.body.origin,
        email: req.body.email,
        quantity,
      };
      const update = await IEcol.updateOne(proID, {
        $inc: { quantity: -quantity },
      });
      const result = await UserImports.insertOne(TobeStored);
      res.send(result);
    });
    //-----------------------------------get specific Imports ------------------------------------------
    app.get("/myimports", AuthVerification, async (req, res) => {
      const email = req.query.email;
      const DBquery = {};
      if (email) {
        DBquery.email = email;
      }
      const cursor = UserImports.find(DBquery);
      const result = await cursor.toArray();
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
//----------------------------------------DELETE with ID------------------------
    app.delete('/myexports/:id',async(req,res)=>{
      const id =req.params.id
      const que={_id: new ObjectId(id)}
      const result=await IEcol.deleteOne(que)
      console.log("deleted");
      
      res.send(result)
    })
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
