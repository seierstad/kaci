import util from "util";

//import {Plugin as ESlintLoaderCombinedReportPlugin from} "eslint-loader";
import UglifyWebpackPlugin from "uglifyjs-webpack-plugin";
//import CheckstyleFormatter from "eslint/lib/formatters/checkstyle";

export const lint = (options = {}) => ({
    plugins: [
        //new ESlintLoaderCombinedReportPlugin(options)
    ]
});

export const load = ({include, exclude, sourceMap = false} = {}) => ({
    "module": {
        "rules": [{
            "test":  /(\.js|\.jsx)$/,
            exclude,
            include,
            "use": [{
                "loader": "babel-loader",
                "options": {
                    cacheDirectory: true,
                    sourceMap
                }
            }]
        }]
    }
});

export const minify = ({sourceMap = false} = {}) => ({
    optimization: {
        minimizer: [
            new UglifyWebpackPlugin({
                uglifyOptions: {
                    compress: {
                        warnings: false,
                        conditionals: true,
                        unused: true,
                        comparisons: true,
                        sequences: true,
                        dead_code: true,
                        evaluate: true,
                        if_return: true,
                        join_vars: true
                    },
                    output: {
                        comments: false
                    }
                },
                sourceMap
            })
        ]
    }
});
