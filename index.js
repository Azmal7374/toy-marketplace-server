const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wlub5y3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     client.connect();

    const db = client.db("Toymarketplace");
    const toyCollection = db.collection("toys");

    app.post("/postToy", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await toyCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
      console.log(result);
    });

    app.get("/allToys", async (req, res) => {
      const result = await toyCollection.find().toArray();
      res.send(result);
    });

    app.get("/allToys/:text", async (req, res) => {
      console.log(req.params.text);
      if (
        req.params.text === "softToys" ||
        req.params.text === "toddlerToys" ||
        req.params.text === "arts&Crafts"
      ) {
        const result = await toyCollection
          .find({ subCategory: req.params.text })
          .toArray();
        // console.log(result);
        return res.send(result);
      } else {
        const result = await toyCollection.find().toArray();
        res.send(result);
      }
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    const indexKeys = { name: 1 };
    const indexOptions = { names: "toyName" };
    const result = await toyCollection.createIndex(indexKeys, indexOptions);
    console.log(result);

    app.get("/toySearchByName/:name", async (req, res) => {
      const searchName = req.params.name;
      const result = await toyCollection
        .find({
          $or: [{ name: { $regex: searchName, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    app.get("/myToys/:email", async (req, res) => {
      console.log(req.params.id);
      const toys = await toyCollection
        .find({
          sellerEamil: req.params.email,
        })
        .toArray();
      res.send(toys);
    });

    app.put("/updateToys/:id", async (req, res) => {
      const id = req.params.id;
      const options = {upset: true};
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: body.price,
          quatntiy: body.quatntiy,
          description: body.description,
          subCategory: body.subCategory,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });



    app.delete("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy MarketPlace Is Running");
});

app.listen(port, () => {
  console.log(`Toy MarketPlace Server is listening on Port: ${port}`);
});
