//import {Plugin as ESlintLoaderCombinedReportPlugin} from "eslint-loader";
import ESLintPlugin from "eslint-webpack-plugin";
import TerserWebpackPlugin from "terser-webpack-plugin";
//import CheckstyleFormatter from "eslint/lib/formatters/checkstyle";

export const lint = ({include, exclude, options = {}}) => ({
    /*
    "module": {
        "rules": [{
            "test":  /(\.js|\.jsx)$/,
            include,
            exclude,
            "enforce": "pre",
            "loader": "eslint-loader"
        }]
    },
    */
    "plugins": [
        new ESLintPlugin(options)
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


export const worklets = ({include, exclude, sourceMap = false} = {}) => ({
    "module": {
        rules: [{
            test: /\.worklet\.js$/,
            include,
            exclude,
            use: [{
                loader: "worklet-loader"
            }, {
                "loader": "babel-loader",
                "options": {
                    cacheDirectory: true,
                    sourceMap
                }
            }]
        }]
    }
});

export const minify = ({sourceMap = false, cache = true} = {}) => ({
    optimization: {
        minimizer: [
            new TerserWebpackPlugin({
                cache,
                sourceMap,
                terserOptions: {
                    ecma: undefined,
                    warnings: false,
                    parse: {},
                    compress: {},
                    mangle: true, // Note `mangle.properties` is `false` by default.
                    module: false,
                    output: null,
                    toplevel: false,
                    nameCache: null,
                    ie8: false,
                    keep_classnames: undefined,
                    keep_fnames: false,
                    safari10: false
                }
            })
        ]
    }
});
