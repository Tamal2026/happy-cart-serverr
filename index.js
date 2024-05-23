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
var app = express();
var cors = require("cors");
var port = process.env.PORT || 5000;
require("dotenv").config();
// Middleware
app.use(cors());
app.use(express.json());
var uri = "mongodb+srv://".concat(process.env.DB_USER, ":").concat(process.env.DB_PASS, "@try-myself.0cjln25.mongodb.net/?retryWrites=true&w=majority&appName=Try-Myself");
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
var client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var userCollection_1, allProductsCollection_1, bestSellerProductCollection_1, cartCollection_1, verifyToken, error_1;
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
                        console.log(req.headers);
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
                    // get data for best seller Products
                    app.get("/best-seller-products", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, error_3;
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
                                    error_3 = _a.sent();
                                    console.error("Error Fetching Best seller Products", error_3);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    //  Users Related Apis
                    app.post("/users", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var user, query, existingUser, result, error_4;
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
                                    error_4 = _a.sent();
                                    console.error("Error inserted of users", error_4);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/users", verifyToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, error_5;
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
                                    error_5 = _a.sent();
                                    console.error("Error getting all users data", error_5);
                                    res.status(500).json({ error: "Internal server error" });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete("/users/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, query, result, error_6;
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
                                    error_6 = _a.sent();
                                    console.error("Error deleting users", error_6);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Make Admin api
                    app.patch("/users/admin/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, filter, updatedDoc, result, error_7;
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
                                    error_7 = _a.sent();
                                    console.error("Error for making a user Admin", error_7);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Cart Related Apis
                    app.post("/cart", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var cartItem, result, error_8;
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
                                    error_8 = _a.sent();
                                    console.error("Error inserting Data for cart", error_8);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete("/cart/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, query, result, error_9;
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
                                    error_9 = _a.sent();
                                    console.error("Error deleting data from cart", error_9);
                                    res.status(500).send({ message: "Internal Server Error" }); // It's good practice to send a response in case of an error
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/cart", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var email, query, result, error_10;
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
                                    error_10 = _a.sent();
                                    console.error(error_10, "cart collection error");
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
