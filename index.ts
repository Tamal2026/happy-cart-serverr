import { error } from "console";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
const jwt = require("jsonwebtoken");
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
    await client.connect();
    const userCollection = client.db("happy-cart").collection("users");
    const allProductsCollection = client
      .db("happy-cart")
      .collection("all-products");
    const bestSellerProductCollection = client
      .db("happy-cart")
      .collection("best-seller-products");
    const cartCollection = client.db("happy-cart").collection("cart");

    // Jwt Related Api

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
    // MiddleWares

    const verifyToken = (req, res, next) => {
      console.log(req.headers);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "Forbidden Access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err: any, decoded: any) => {
          if (err) {
            return res.status(401).send({ message: "forbidden access" });
          }
          req.decoded = decoded;
          next();
        }
      );
    };

    // Verify Admin
    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "Unauthoraized Access" });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
      admin =  user?.role === "admin";
      }
      res.send({ admin });
    });

    // Product Related apis

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

    //  Users Related Apis

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
    app.get("/users", verifyToken,  async (req, res) => {
      console.log(req.headers);
      try {
        const result = await userCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error getting all users data", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.delete("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting users", error);
      }
    });

    // Make Admin api
    app.patch("/users/admin/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await userCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (error) {
        console.error("Error for making a user Admin", error);
      }
    });

    // Cart Related Apis
    app.post("/cart", async (req, res) => {
      try {
        const cartItem = req.body;
        const result = await cartCollection.insertOne(cartItem);
        res.send(result);
      } catch (error) {
        console.error("Error inserting Data for cart", error);
      }
    });

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
