import * as path from "path";
import * as os from "os";
const express = require("express");
import * as http from "http";
import * as proxy from "express-http-proxy";


const debug = require("debug")("pipeline-api:server");

let webpackConfig = null;
let Webpack = null;
let webpackDevServer = null;
let compiler = null;

if (process.env.NODE_ENV !== "production") {
    webpackConfig = require("../webpack.dev.config.js");
    Webpack = require("webpack");
    webpackDevServer = require("webpack-dev-server");
    compiler = Webpack(webpackConfig);
}

import {Configuration} from "./configuration";

const apiUri = `http://${Configuration.graphQLHostname}:${Configuration.graphQLPort}`;

const hostname = process.env.NODE_ENV == "production" ? os.hostname() : "localhost";

let socketIoPortOffset: number = 0;

startExpressServer();

function startExpressServer() {

    debug(`preparing http://${hostname}:${Configuration.port}/`);

    const rootPath = path.resolve(path.join(__dirname, "..", "public"));

    let app = null;

    if (process.env.NODE_ENV !== "production") {
        app = devServer();

        app.listen(Configuration.port, "0.0.0.0", () => {
            debug(`listening at http://${hostname}:${Configuration.port}/`);
        });

        startSocketIOServer();
    } else {
        app = express();

        app.use(express.static(rootPath));

        app.post("/graphql", proxy(apiUri + "/graphql"));

        app.use("/thumbnail", proxy(apiUri + "/thumbnail"));

        app.use("/thumbnailData", proxy(apiUri + "/thumbnailData"));

        app.use(`${Configuration.internalApiBase}serverConfiguration`, serverConfiguration);

        app.use("/", (req, res) => {
            res.sendFile(path.join(rootPath, "index.html"));
        });

        const server = http.createServer(app);

        startSocketIOServer(server);

        server.listen(Configuration.port, "0.0.0.0", () => {
            debug(`listening at http://${hostname}:${Configuration.port}/`);
        });
    }
}

function startSocketIOServer(server = null) {
    const needCreateServer = server === null;

    if (needCreateServer) {
        server = http.createServer(() => {
        });
    }

    const io = require("socket.io")(server);

    io.on("connection", (socket) => {
        socket.on("stopMicroscopeAcquisition", () => {
        });
        socket.on("restartHubProxy", () => {
        });
    });

    if (needCreateServer) {
        socketIoPortOffset = 1;
        const ipPort = Configuration.port + 1;

        debug(`preparing socket.io at http://${hostname}:${ipPort}/`);
        server.listen(ipPort, () => {
            debug(`socket.io listening at http://${hostname}:${ipPort}/`);
        });
    }
}

function serverConfiguration(req, resp) {
    resp.json({
        buildVersion: Configuration.buildVersion,
        processId: process.pid,
        thumbsHostname: Configuration.thumbsHostname,
        thumbsPort: Configuration.thumbsPort,
        thumbsPath: Configuration.thumbsPath,
        isActivePipeline: Configuration.isActivePipeline,
        socketIoPortOffset: socketIoPortOffset
    });
}

function devServer() {
    return new webpackDevServer(compiler, {
        stats: {
            colors: true
        },
        before: (app) => {
            app.use(`${Configuration.internalApiBase}serverConfiguration`, serverConfiguration);
        },
        proxy: {
            "/graphql": {
                target: apiUri
            },
            "/thumbnail": {
                target: apiUri
            },
            "/thumbnailData": {
                target: apiUri
            }
        },
        contentBase: path.resolve(path.join(__dirname, "..", "public")),
        disableHostCheck: true,
        publicPath: webpackConfig.output.publicPath,
        // hot: true,
        historyApiFallback: true,
        noInfo: false,
        quiet: false
    });
}

