
const express = require('express');
const axios = require('axios');
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://rohit:rana@cluster0.btddseq.mongodb.net/fineArt?retryWrites=true&w=majority',
    { useUnifiedTopology: true, useNewUrlParser: true },
).then(() => app.listen(3000)
).then(() => console.log("connected to Database and running on port 3000")
);

const authRoute = require("./routes/auth");

app.use("/api/auth", authRoute);



