
import path from "path";
import webpack from "webpack";
import merge from "webpack-merge";
import parts from "./webpack.parts";
//import metaParts from "./webpack.parts.meta";

const rootPath = path.normalize(__dirname + "/..");

const PATHS = {
    app: path.join(rootPath, "src", "js"),
    build: path.join(rootPath, "dist"),
    reports: path.join("reports"),
    svg: path.join("src", "images", "svg")
};


const commonConfig = merge([
    {
        "context": rootPath,
        "entry": {
            "main": path.join(PATHS.app, "kaci.jsx")
        },
        "output": {
            "filename": "[name].[hash:6].js",
            "path": path.resolve(PATHS.build),
            "publicPath": "/",
            "chunkFilename": "[name].[chunkhash:6].js"
        },
        "optimization": {
            "splitChunks": {},
            "noEmitOnErrors": true,
            "runtimeChunk": true
        },
        "plugins": [
            //new webpack.AutomaticPrefetchPlugin()
        ]
    },
    //parts.clean(PATHS.build, PATHS.reports),
    //parts.getFonts({fonts, path: path.join(PATHS.build, "fonts")}),
    //parts.loadFonts(),
    parts.loadHTML({
        inject: "head",
        minify: true,
        template: "./src/markup/index.html"
    }),
    parts.lintJS({
        formatter: "checkstyle",
        filePath: path.join(PATHS.reports, "checkstyle-eslint-report.xml")
    })
    /*,
    parts.loadSVG(),
    parts.favicons({
        logo: path.resolve("./src/images/svg/dib-logo.svg"),
        prefix: "icon-[hash:6]/",
        emitStats: true,
        statsFilename: "iconstats-[hash:6].json",
        persistentCache: false,
        inject: true
    })
    //parts.generateServiceWorker()
    //metaParts.bundleTracker()
    //metaParts.analyzeBundle()
    */
]);


const loadJSOptions = {
    exclude: /(node_modules|src\/js\/worklets)/,
    include: PATHS.app
};

const loadWorkletsOptions = {
    include: /(src\/js\/worklets)/
};

const minifyJSOptions = {};

const loadCSSOptions = {
    svgPath: PATHS.svg
};

const minifyCSSOptions = {};

const productionConfig = merge([
    {
        "recordsPath": path.join(rootPath, "records-prod.json")
    },
    parts.loadJS(loadJSOptions),
    parts.loadWorklets(loadWorkletsOptions),
    parts.minifyJS(),
    parts.loadCSS(loadCSSOptions),
    parts.minifyCSS(),
    parts.compression()
]);

const developmentConfig = merge([
    {
        "recordsPath": path.join(rootPath, "records-dev.json")
    },
    parts.loadJS({
        ...loadJSOptions,
        sourceMap: true
    }),
    parts.loadWorklets(loadWorkletsOptions),
    parts.minifyJS({
        ...minifyJSOptions,
        sourceMap: true
    }),
    parts.loadCSS({
        ...loadCSSOptions,
        dev: true,
        sourceMap: true
    }),
    parts.minifyCSS({
        ...minifyCSSOptions,
        sourceMap: true
    }),
    parts.generateSourceMaps({type: "source-map"}),
    parts.devServer({
        contentBase: PATHS.build,
        host: process.env.HOST,
        port: process.env.PORT
    })
]);

const conf = (mode = "development") => {
    console.log("bygger ", mode);
    if (mode === "production") {
        return merge(commonConfig, productionConfig, {
            mode
        });
    }
    return merge(commonConfig, developmentConfig, {
        mode
    });
};

export default conf;