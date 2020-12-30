import connect from "connect";
import historyApiFallback from "connect-history-api-fallback";
import expires from "connect-expires";
import serveStatic from "connect-gzip-static";


const EXPIRE_DURATION_MS = 1296000000; // 1000 * 60 * 60 * 24 * 15 = 15 days
const expire = expires({
    pattern: /^(?:\/js\/|\/styles\/|\/images\/)/,
    duration: EXPIRE_DURATION_MS
});


const historyApi = historyApiFallback({
    verbose: true,
    rewrites: [

    ]
});
const app = connect();
app.use(historyApi);
app.use(serveStatic(__dirname + "/../dist"));
app.use(expire);


console.log("server starting");
const PORT = 8181;
const server = app.listen(PORT);
console.log("server started, listening to port " + PORT);
