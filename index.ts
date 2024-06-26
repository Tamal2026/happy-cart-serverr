import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { it } from "node:test";

const jwt = require("jsonwebtoken");
const express = require("express");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();

const cors = require("cors");

const port = process.env.PORT || 5000;

// Middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@try-myself.0cjln25.mongodb.net/?retryWrites=true&w=majority&appName=Try-Myself`;

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
    const paymentCollection = client.db("happy-cart").collection("payments");
    const reviewsCollection = client.db("happy-cart").collection("reviews");
    const wishlistCollection = client.db("happy-cart").collection("wishlists");

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
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      next();
    };

    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "Unauthoraized Access" });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
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

    // Updated Product
    app.get("/all-products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await allProductsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error from the updated product ");
      }
    });

    app.patch("/all-products/:id", async (req, res) => {
      try {
        const product = req.body;
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            name: product.name,
            category: product.category,
            price: product.price,
            img: product.img,
            short_desc: product.short_desc,
          },
        };
        const result = await allProductsCollection.updateOne(
          filter,
          updatedDoc
        );
        res.send(result);
      } catch (error) {
        console.error("Error from the Admin updated product");
      }
    });

    app.post("/all-products", async (req, res) => {
      try {
        const product = req.body;
        const result = await allProductsCollection.insertOne(product);
        res.send(result);
      } catch (error) {
        console.error("Error from the new add product insert", error);
      }
    });

    // delete product from manage users admin dashboard
    app.delete(
      "/all-products/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await allProductsCollection.deleteOne(query);
          res.send(result);
        } catch (error) {
          console.error(
            "Error from delete product from the admin dashboard",
            error
          );
        }
      }
    );
    //  wishlist Apis

    app.get("/wishlist", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };
        const result = await wishlistCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("error from the wishlist get", error);
      }
    });
    app.post("/wishlist", async (req, res) => {
      try {
        const product = req.body;
        const existingProduct = await wishlistCollection.findOne({
          email: product.email,
          name: product.name,
        });
        if (existingProduct) {
          return res.send({
            message: "This product already in wishlist",
            insertedId: null,
          });
        }
        const result = await wishlistCollection.insertOne(product);
        res.send(result);
      } catch (error) {
        console.error("Error from data added to db");
      }
    });

    app.delete("/wishlist/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await wishlistCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error from the deleting wishlist item", error);
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

    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
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
    app.patch(
      "/users/admin/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
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
      }
    );

    // Cart Related Apis
   

    app.delete("/cart/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await cartCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting data from cart", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.post("/cart", async (req, res) => {
      try {
        const product = req.body;
        const existingProduct = await cartCollection.findOne({
          name: product.name,
          email:product.email
        });
        if (existingProduct) {
          return res.send({
            message: "This product is already in the cart",
            insertedId: null,
          });
        }
        const result = await cartCollection.insertOne(product);
        res.send({
          message: "Product added to cart successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error adding the product to cart:", error);
        res.status(500).send("Internal Server Error");
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
    // User Dashboard Overview
    app.get("/userOverview", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };
        const result = await paymentCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Erros From the userOVer view", error);
      }
    });

    // Payment Related Apis

    // Payment Intent
    app.post("/create-payment-intent", async (req, res) => {
      try {
        const { price } = req.body;
        const amount = parseInt((price * 100).toFixed(2));
        console.log(amount, "amount inside the intent");

        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });
        console.log("Client secret in the server", paymentIntent.client_secret);
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.error("Error from the payment-intent-server", error);
      }
    });

    app.post("/payments", async (req, res) => {
      try {
        const payment = req.body;
        const paymentResult = await paymentCollection.insertOne(payment);
        const query = {
          _id: {
            $in: payment.cartIds.map((id) => new ObjectId(id)),
          },
        };
        const deleResult = await cartCollection.deleteMany(query);
        res.send({ paymentResult, deleResult });
      } catch (error) {
        console.error("Error from payments confirm server", error);
      }
    });

    app.get("/payments/:email", verifyToken, async (req, res) => {
      try {
        const query = { email: req.params.email };
        if (req.params.email !== req.decoded.email) {
          return res.status(403).send({ message: "Forbidden Access" });
        }
        const result = await paymentCollection.find(query).toArray();
        res.send(result);
      } catch (error) {}
    });

    // Admin overview related apis
    // stats or analytics
    app.get("/admin-stats", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const users = await userCollection.estimatedDocumentCount();
        const totalProducts =
          await allProductsCollection.estimatedDocumentCount();
        const totalOrders = await paymentCollection.estimatedDocumentCount();

        const result = await paymentCollection
          .aggregate([
            {
              $group: {
                _id: null,
                totalRevenue: {
                  $sum: "$price",
                },
              },
            },
          ])
          .toArray();
        const revenue = result.length > 0 ? result[0].totalRevenue : 0;
        res.send({ users, totalProducts, totalOrders, revenue });
      } catch (error) {}
    });
    // using aggregate pipline
    app.get("/order-stats", async (req, res) => {
      try {
        const result = await paymentCollection
          .aggregate([
            {
              $unwind: "$productItemIds",
            },
            {
              $lookup: {
                from: "all-products",
                let: { productId: { $toObjectId: "$productItemIds" } }, // Convert productItemIds to ObjectId
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$productId"] },
                    },
                  },
                ],
                as: "productItem",
              },
            },
            {
              $unwind: "$productItem",
            },
            {
              $group: {
                _id: "$productItem.category",
                quantity: { $sum: 1 },
                revenue: { $sum: "$productItem.price" },
              },
            },
            {
              $project: {
                _id: 0,
                category: "$_id",
                quantity: "$quantity",
                revenue: "$revenue",
              },
            },
          ])
          .toArray();

        console.log("Aggregation Result:", result); // Log the result

        res.send(result);
      } catch (error) {
        console.error("Error fetching order stats:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Review Relatied api
    app.post("/reviews", async (req, res) => {
      try {
        const review = req.body;
        const result = await reviewsCollection.insertOne(review);
        res.send(result);
      } catch (error) {
        console.error("Error from the revies adding to db", error);
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
