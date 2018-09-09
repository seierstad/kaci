import HtmlWebpackPlugin from "html-webpack-plugin";
import ScriptExtHtmlWebpackPlugin from "script-ext-html-webpack-plugin";

export const load = (options = {}) => {
    const {
        include,
        exclude
    } = options;
    return {
        "module": {
            "rules": [{
                test: /\.html$/,
                use: [{
                    loader: "html-loader"
                }, {
                    loader: "htmllint-loader"
                }]
            }]
        },
        "plugins": [
            new HtmlWebpackPlugin(options),
            new ScriptExtHtmlWebpackPlugin({
                defaultAttribute: "defer"
            })
        ]
    };
};
