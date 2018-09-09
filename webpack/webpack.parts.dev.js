import webpack from "webpack";

const server = ({contentBase, host = "localhost", port = DEFAULT_PORT} = {}) => ({
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    "devServer": {
        "index": "index.html",
        "compress": true,
        "historyApiFallback": true,
        "hot": true,
        "https": false, // trengs til serviceworker fra localhost
        "overlay": true,
        "open": true,
        contentBase,
        port
    }
});

export default server;
