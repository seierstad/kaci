import http from "http";

import connect from "connect";

import bodyParser from "body-parser";
import compression from "compression";


const app = connect();

// gzip/deflate outgoing responses
app.use(compression());

// parse urlencoded request bodies into req.body
app.use(bodyParser.urlencoded({extended: false}));

// respond to all requests
app.use(function (req, res) {
    res.end("Hello from Connect!\n");
});

//create node.js http server and listen on port
http.createServer(app).listen(3001);
