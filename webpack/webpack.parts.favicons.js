import FaviconsWebpackPlugin from "favicons-webpack-plugin";


export const favicons = (options = {}) => {
    /*
    "module": {
        "rules": [{
            "test": /manifest.json$/,
            "use": [{
                "loader": "file-loader"
            }]
        }]
    },
    */
    return {
        "plugins": [
            new FaviconsWebpackPlugin(options)
        ]
    };
};
