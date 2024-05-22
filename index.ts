import { error } from "console";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

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
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const userCollection = client.db("happy-cart").collection("users");
    const allProductsCollection = client
      .db("happy-cart")
      .collection("all-products");
    const bestSellerProductCollection = client
      .db("happy-cart")
      .collection("best-seller-products");
    const cartCollection = client.db("happy-cart").collection("cart");
    // get data for all Products
    app.get("/all-products", async (req, res) => {
      try {
        const result = await allProductsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching products", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    // get data for best seller Products
    app.get("/best-seller-products", async (req, res) => {
      try {
        const result = await bestSellerProductCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error Fetching Best seller Products", error);
      }
    });

    // cart collection
    app.get("/cart", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };
        const result = await cartCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error(error, "cart collection error");
      }
    });

    //  Users Related Api

    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: "User already exists", insertedId: null });
        }
        const result = userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        console.error("Error inserted of users", error);
      }
    });

    // Post req for cart data
    app.post("/cart", async (req, res) => {
      try {
        const cartItem = req.body;
        const result = await cartCollection.insertOne(cartItem);
        res.send(result);
      } catch (error) {
        console.error("Error inserting Data for cart", error);
      }
    });

    // Delete item from cart

    app.delete("/cart/:id", async (req, res) => {
      try {
        const id = req.params.id; // Fix the typo here
        const query = { _id: new ObjectId(id) };
        const result = await cartCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting data from cart", error);
        res.status(500).send({ message: "Internal Server Error" }); // It's good practice to send a response in case of an error
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
