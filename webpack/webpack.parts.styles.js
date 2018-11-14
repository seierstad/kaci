import MiniCssExtractPlugin from "mini-css-extract-plugin";
import autoprefixer from "autoprefixer";
import inlineSvg from "postcss-inline-svg";
import flexbugsFixes from "postcss-flexbugs-fixes";
import cssnano from "cssnano";
import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin";
import dartSass from "dart-sass";
import Fiber from "fibers";

export const load = ({include, exclude, svgPath, sourceMap = false, dev = false} = {}) => ({
    module: {
        rules: [{
            test: /\.(sa|sc|c)ss$/,
            include,
            exclude,
            use: [{
                loader: dev ? "style-loader" : MiniCssExtractPlugin.loader,
                options: {
                    sourceMap
                }
            }, {
                loader: "css-loader",
                options: {
                    importLoaders: 2,
                    sourceMap
                }
            }, {
                loader: "postcss-loader",
                options: {
                    ident: "postcss",
                    plugins: [
                        /*
                        fontMagician({
                            formats: "woff2 woff",
                            variants: {
                                "Roboto Condensed": {
                                    "300": [],
                                    "400": [],
                                    "700": []
                                }
                            },
                            hosted: ["./src/fonts", "/styles/fonts"],
                            foundries: ["hosted", "google"]
                        }),
                        */
                        inlineSvg({
                            "path": svgPath
                        }),
                        flexbugsFixes,
                        autoprefixer()
                    ],
                    sourceMap
                }
            }, {
                loader: "sass-loader",
                options: {
                    implementation: dartSass,
                    fiber: Fiber,
                    includePaths: [
                        "node_modules/susy/sass",
                        "node_modules/breakpoint-sass/stylesheets"
                    ],
                    sourceMap
                }
            }]
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            "filename": "styles/[name].[contenthash:6].css",
            "chunkFilename": "styles/[id].[chunkhash:6].css"
        })
    ]
});


export const minify = (options = {}) => ({
    optimization: {
        minimizer: [
            new OptimizeCSSAssetsPlugin({
                cssProcessor: cssnano,
                cssProcessorOptions: options,
                canPrint: true
            })
        ]
    }
});
