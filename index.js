
// const express = require('express');
// const axios = require('axios');
// const mongoose = require("mongoose");
// const app = express();
// app.use(express.json());

// mongoose.connect('mongodb+srv://rohit:rana@cluster0.btddseq.mongodb.net/fineArt?retryWrites=true&w=majority',
//     { useUnifiedTopology: true, useNewUrlParser: true },
// ).then(() => app.listen(3000)
// ).then(() => console.log("connected to Database and running on port 3000")
// );

// const authRoute = require("./routes/auth");

// app.use("/api/auth", authRoute);


const express = require('express');
const app = express();
const PORT = 3000;

// This middleware will not allow the
// request to go beyond it
app.use(function (req, res, next) {
	console.log("Middleware called")
	next();
});

// Requests will never reach this route
app.get('/user', function (req, res) {
	console.log("/user request called");
	res.send('Welcome to GeeksforGeeks');
});

app.listen(PORT, function(err){
	if (err) console.log(err);
	console.log("Server listening on PORT", PORT);
});
