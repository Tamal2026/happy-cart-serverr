import { error } from "console";
import { MongoClient, ServerApiVersion } from "mongodb";

const express = require("express");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 5000;
require("dotenv").config();
// Middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@try-myself.0cjln25.mongodb.net/?retryWrites=true&w=majority&appName=Try-Myself`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //
    const allProductsCollection = client
      .db("happy-cart")
      .collection("all-products");
    app.get("/all-products", async (req, res) => {
      try {
        const result = await allProductsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching products", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    const bestSellerProductCollection = client
      .db("happy-cart")
      .collection("best-seller-products");
    app.get("/best-seller-products", async (req, res) => {
      try {
        const result = await bestSellerProductCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error Fetching Best seller Products", error);
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } catch (error) {
    console.error("error connecting to MongoDb:", error);
    process.exit(1);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("boss is running");
});
app.listen(port, () => {
  console.log(`The server is running on port ${port} `);
});
