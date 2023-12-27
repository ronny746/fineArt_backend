const cors = require('cors');
const express = require('express');
const axios = require('axios');
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// mongoose.connect('mongodb+srv://rohit:rana@cluster0.btddseq.mongodb.net/fineArt?retryWrites=true&w=majority',
//     { useUnifiedTopology: true, useNewUrlParser: true },
// ).then(() => app.listen(3000)
// ).then(() => console.log("connected to Database and running on port 3000")
// );

const authRoute = require("./routes/auth");
const categoryRoute = require("./routes/category");
const subcategoryRoute = require("./routes/sub_category");
const productRoute = require("./routes/product");

app.use("/api/auth", authRoute);
app.use("/api/category", categoryRoute);
app.use("/api/subcategory", subcategoryRoute);
app.use("/api/product", productRoute);



