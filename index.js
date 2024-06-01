"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
var jwt = require("jsonwebtoken");
var express = require("express");
require("dotenv").config();
var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
var app = express();
var cors = require("cors");
var port = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
var uri = "mongodb+srv://".concat(process.env.DB_USER, ":").concat(process.env.DB_PASS, "@try-myself.0cjln25.mongodb.net/?retryWrites=true&w=majority&appName=Try-Myself");
var client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var userCollection_1, allProductsCollection_1, bestSellerProductCollection_1, cartCollection_1, paymentCollection_1, reviewsCollection_1, wishlistCollection_1, verifyToken, verifyAdmin, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    userCollection_1 = client.db("happy-cart").collection("users");
                    allProductsCollection_1 = client
                        .db("happy-cart")
                        .collection("all-products");
                    bestSellerProductCollection_1 = client
                        .db("happy-cart")
                        .collection("best-seller-products");
                    cartCollection_1 = client.db("happy-cart").collection("cart");
                    paymentCollection_1 = client.db("happy-cart").collection("payments");
                    reviewsCollection_1 = client.db("happy-cart").collection("reviews");
                    wishlistCollection_1 = client.db("happy-cart").collection("wishlists");
                    // Jwt Related Api
                    app.post("/jwt", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var user, token;
                        return __generator(this, function (_a) {
                            user = req.body;
                            token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                                expiresIn: "1h",
                            });
                            res.send({ token: token });
                            return [2 /*return*/];
                        });
                    }); });
                    verifyToken = function (req, res, next) {
                        if (!req.headers.authorization) {
                            return res.status(401).send({ message: "Forbidden Access" });
                        }
                        var token = req.headers.authorization.split(" ")[1];
                        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                            if (err) {
                                return res.status(401).send({ message: "forbidden access" });
                            }
                            req.decoded = decoded;
                            next();
                        });
                    };
                    verifyAdmin = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                        var email, query, user, isAdmin;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    email = req.decoded.email;
                                    query = { email: email };
                                    return [4 /*yield*/, userCollection_1.findOne(query)];
                                case 1:
                                    user = _a.sent();
                                    isAdmin = (user === null || user === void 0 ? void 0 : user.role) === "admin";
                                    if (!isAdmin) {
                                        return [2 /*return*/, res.status(403).send({ message: "Forbidden access" })];
                                    }
                                    next();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    app.get("/users/admin/:email", verifyToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var email, query, user, admin;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    email = req.params.email;
                                    if (email !== req.decoded.email) {
                                        return [2 /*return*/, res.status(403).send({ message: "Unauthoraized Access" })];
                                    }
                                    query = { email: email };
                                    return [4 /*yield*/, userCollection_1.findOne(query)];
                                case 1:
                                    user = _a.sent();
                                    admin = false;
                                    if (user) {
                                        admin = (user === null || user === void 0 ? void 0 : user.role) === "admin";
                                    }
                                    res.send({ admin: admin });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Product Related apis
                    // get data for all Products
                    app.get("/all-products", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, allProductsCollection_1.find().toArray()];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_2 = _a.sent();
                                    console.error("Error fetching products", error_2);
                                    res.status(500).json({ error: "Internal server error" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Updated Product
                    app.get("/all-products/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, query, result, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    query = { _id: new mongodb_1.ObjectId(id) };
                                    return [4 /*yield*/, allProductsCollection_1.findOne(query)];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_3 = _a.sent();
                                    console.error("Error from the updated product ");
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.patch("/all-products/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var product, id, filter, updatedDoc, result, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    product = req.body;
                                    id = req.params.id;
                                    filter = { _id: new mongodb_1.ObjectId(id) };
                                    updatedDoc = {
                                        $set: {
                                            name: product.name,
                                            category: product.category,
                                            price: product.price,
                                            img: product.img,
                                            short_desc: product.short_desc,
                                        },
                                    };
                                    return [4 /*yield*/, allProductsCollection_1.updateOne(filter, updatedDoc)];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_4 = _a.sent();
                                    console.error("Error from the Admin updated product");
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/all-products", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var product, result, error_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    product = req.body;
                                    return [4 /*yield*/, allProductsCollection_1.insertOne(product)];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_5 = _a.sent();
                                    console.error("Error from the new add product insert", error_5);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // delete product from manage users admin dashboard
                    app.delete("/all-products/:id", verifyToken, verifyAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, query, result, error_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    query = { _id: new mongodb_1.ObjectId(id) };
                                    return [4 /*yield*/, allProductsCollection_1.deleteOne(query)];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_6 = _a.sent();
                                    console.error("Error from delete product from the admin dashboard", error_6);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    //  wishlist Apis
                    app.get("/wishlist", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var email, query, result, error_7;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    email = req.query.email;
                                    query = { email: email };
                                    return [4 /*yield*/, wishlistCollection_1.find(query).toArray()];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_7 = _a.sent();
                                    console.error("error from the wishlist get", error_7);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/wishlist", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var product, existingProduct, result, error_8;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    product = req.body;
                                    return [4 /*yield*/, wishlistCollection_1.findOne({
                                            email: product.email,
                                            name: product.name,
                                        })];
                                case 1:
                                    existingProduct = _a.sent();
                                    if (existingProduct) {
                                        return [2 /*return*/, res.send({
                                                message: "This product already in wishlist",
                                                insertedId: null,
                                            })];
                                    }
                                    return [4 /*yield*/, wishlistCollection_1.insertOne(product)];
                                case 2:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_8 = _a.sent();
                                    console.error("Error from data added to db");
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete("/wishlist/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, query, result, error_9;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    query = { _id: new mongodb_1.ObjectId(id) };
                                    return [4 /*yield*/, wishlistCollection_1.deleteOne(query)];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_9 = _a.sent();
                                    console.error("Error from the deleting wishlist item", error_9);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // get data for best seller Products
                    app.get("/best-seller-products", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, error_10;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, bestSellerProductCollection_1.find().toArray()];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_10 = _a.sent();
                                    console.error("Error Fetching Best seller Products", error_10);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    //  Users Related Apis
                    app.post("/users", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var user, query, existingUser, result, error_11;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    user = req.body;
                                    query = { email: user.email };
                                    return [4 /*yield*/, userCollection_1.findOne(query)];
                                case 1:
                                    existingUser = _a.sent();
                                    if (existingUser) {
                                        return [2 /*return*/, res.send({ message: "User already exists", insertedId: null })];
                                    }
                                    result = userCollection_1.insertOne(user);
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_11 = _a.sent();
                                    console.error("Error inserted of users", error_11);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/users", verifyToken, verifyAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, error_12;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log(req.headers);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, userCollection_1.find().toArray()];
                                case 2:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_12 = _a.sent();
                                    console.error("Error getting all users data", error_12);
                                    res.status(500).json({ error: "Internal server error" });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete("/users/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, query, result, error_13;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    query = { _id: new mongodb_1.ObjectId(id) };
                                    return [4 /*yield*/, userCollection_1.deleteOne(query)];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_13 = _a.sent();
                                    console.error("Error deleting users", error_13);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Make Admin api
                    app.patch("/users/admin/:id", verifyToken, verifyAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, filter, updatedDoc, result, error_14;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    filter = { _id: new mongodb_1.ObjectId(id) };
                                    updatedDoc = {
                                        $set: {
                                            role: "admin",
                                        },
                                    };
                                    return [4 /*yield*/, userCollection_1.updateOne(filter, updatedDoc)];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_14 = _a.sent();
                                    console.error("Error for making a user Admin", error_14);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Cart Related Apis
                    app.post("/cart", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var cartItem, result, error_15;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    cartItem = req.body;
                                    return [4 /*yield*/, cartCollection_1.insertOne(cartItem)];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_15 = _a.sent();
                                    console.error("Error inserting Data for cart", error_15);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete("/cart/:id", verifyToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, query, result, error_16;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    query = { _id: new mongodb_1.ObjectId(id) };
                                    return [4 /*yield*/, cartCollection_1.deleteOne(query)];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_16 = _a.sent();
                                    console.error("Error deleting data from cart", error_16);
                                    res.status(500).send({ message: "Internal Server Error" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/cart", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var email, query, result, error_17;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    email = req.query.email;
                                    query = { email: email };
                                    return [4 /*yield*/, cartCollection_1.find(query).toArray()];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_17 = _a.sent();
                                    console.error(error_17, "cart collection error");
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // User Dashboard Overview
                    app.get("/userOverview", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var email, query, result, error_18;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    email = req.query.email;
                                    query = { email: email };
                                    return [4 /*yield*/, paymentCollection_1.find(query).toArray()];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_18 = _a.sent();
                                    console.error("Erros From the userOVer view", error_18);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Payment Related Apis
                    // Payment Intent
                    app.post("/create-payment-intent", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var price, amount, paymentIntent, error_19;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    price = req.body.price;
                                    amount = parseInt((price * 100).toFixed(2));
                                    console.log(amount, "amount inside the intent");
                                    return [4 /*yield*/, stripe.paymentIntents.create({
                                            amount: amount,
                                            currency: "usd",
                                            payment_method_types: ["card"],
                                        })];
                                case 1:
                                    paymentIntent = _a.sent();
                                    console.log("Client secret in the server", paymentIntent.client_secret);
                                    res.send({
                                        clientSecret: paymentIntent.client_secret,
                                    });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_19 = _a.sent();
                                    console.error("Error from the payment-intent-server", error_19);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/payments", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var payment, paymentResult, query, deleResult, error_20;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    payment = req.body;
                                    return [4 /*yield*/, paymentCollection_1.insertOne(payment)];
                                case 1:
                                    paymentResult = _a.sent();
                                    query = {
                                        _id: {
                                            $in: payment.cartIds.map(function (id) { return new mongodb_1.ObjectId(id); }),
                                        },
                                    };
                                    return [4 /*yield*/, cartCollection_1.deleteMany(query)];
                                case 2:
                                    deleResult = _a.sent();
                                    res.send({ paymentResult: paymentResult, deleResult: deleResult });
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_20 = _a.sent();
                                    console.error("Error from payments confirm server", error_20);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/payments/:email", verifyToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var query, result, error_21;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    query = { email: req.params.email };
                                    if (req.params.email !== req.decoded.email) {
                                        return [2 /*return*/, res.status(403).send({ message: "Forbidden Access" })];
                                    }
                                    return [4 /*yield*/, paymentCollection_1.find(query).toArray()];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_21 = _a.sent();
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Admin overview related apis
                    // stats or analytics
                    app.get("/admin-stats", verifyToken, verifyAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var users, totalProducts, totalOrders, result, revenue, error_22;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    return [4 /*yield*/, userCollection_1.estimatedDocumentCount()];
                                case 1:
                                    users = _a.sent();
                                    return [4 /*yield*/, allProductsCollection_1.estimatedDocumentCount()];
                                case 2:
                                    totalProducts = _a.sent();
                                    return [4 /*yield*/, paymentCollection_1.estimatedDocumentCount()];
                                case 3:
                                    totalOrders = _a.sent();
                                    return [4 /*yield*/, paymentCollection_1
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
                                            .toArray()];
                                case 4:
                                    result = _a.sent();
                                    revenue = result.length > 0 ? result[0].totalRevenue : 0;
                                    res.send({ users: users, totalProducts: totalProducts, totalOrders: totalOrders, revenue: revenue });
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_22 = _a.sent();
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    // using aggregate pipline
                    app.get("/order-stats", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, error_23;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, paymentCollection_1
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
                                            .toArray()];
                                case 1:
                                    result = _a.sent();
                                    console.log("Aggregation Result:", result); // Log the result
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_23 = _a.sent();
                                    console.error("Error fetching order stats:", error_23);
                                    res.status(500).json({ error: "Internal server error" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Review Relatied api
                    app.post("/reviews", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var review, result, error_24;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    review = req.body;
                                    return [4 /*yield*/, reviewsCollection_1.insertOne(review)];
                                case 1:
                                    result = _a.sent();
                                    res.send(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_24 = _a.sent();
                                    console.error("Error from the revies adding to db", error_24);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("error connecting to MongoDb:", error_1);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
run().catch(console.dir);
app.get("/", function (req, res) {
    res.send("boss is running");
});
app.listen(port, function () {
    console.log("The server is running on port ".concat(port, " "));
});
