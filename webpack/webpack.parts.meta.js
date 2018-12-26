import path from "path";
import webpack from "webpack";
import BundleTracker from "webpack-bundle-tracker";
import {BundleAnalyzerPlugin} from "webpack-bundle-analyzer";
import DashboardPlugin from "webpack-dashboard/plugin";

export const analyzeBundle = ({reportsPath = __dirname} = {}) => ({
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
            generateStatsFile: true,
            statsFileName: path.join(reportsPath, "stats.json")
        })
    ]
});

export const bundleTracker = (options = {}) => ({
    plugins: [
        new BundleTracker({
            path: __dirname,
            filename: "webpack-stats.json",
            ...options
        })
    ]
});


export const dashboard = (options = {}) => ({
    plugins: [
        new DashboardPlugin(options)
    ]
});

export const profiling = (options = {}) => {

    const {
        filename = "profileEvents.json",
        dir = "profiling"
    } = options;

    const outputPath = path.join(dir, filename);

    return {
        plugins: [
            new webpack.debug.ProfilingPlugin({outputPath})
        ]
    };
};

