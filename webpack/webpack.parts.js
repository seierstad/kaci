import webpack from "webpack";
import CompressionPlugin from "compression-webpack-plugin";
import * as js from "./webpack.parts.scripts";
import * as html from "./webpack.parts.html";
import * as dev from "./webpack.parts.dev";
import * as styles from "./webpack.parts.styles";


const parts = {
    loadHTML: html.load,
    loadCSS: styles.load,
    minifyCSS: styles.minify,
    loadSVG: () => {},
    lintJS: js.lint,
    loadJS: js.load,
    loadWorklets: js.worklets,
    minifyJS: js.minify,
    getFonts: () => {},
    loadFonts: () => {},
    generateServiceWorker: () => {},
    favicons: () => {},
    generateSourceMaps: ({type} = {}) => ({
        devtool: type
    }),
    compression: (options = {}) => ({
        plugins: [
            new CompressionPlugin({...options})
        ]
    }),
    devServer: () => {}
};

export default parts;
