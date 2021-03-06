import {isNullOrUndefined} from "util";

const configurations = {
    port: 6101,
    internalApiBase: "/api/v1/internal/",
    graphQLHostname: "pipeline-api",
    graphQLPort: 6001,
    graphQlEndpoint: "/graphql",
    thumbsHostname: "pipeline-api",
    thumbsPort: 6001,
    thumbsPath: "/thumbnail",
    authRequired: true,
    authUser: "mouselight",
    authPassword: "auth_secret", // always override this, but in the event env is not set, don't leave completely open
    name: "Pipeline",
    buildVersion: 5,
    isActivePipeline: true
};

function loadServerOptions() {
    const options = Object.assign({}, configurations);

    options.port = parseInt(process.env.PIPELINE_API_CLIENT_PORT) || options.port;
    options.graphQLHostname = process.env.PIPELINE_API_HOST || options.graphQLHostname;
    options.graphQLPort = parseInt(process.env.PIPELINE_API_PORT) || options.graphQLPort;
    options.thumbsHostname = process.env.PIPELINE_THUMBS_HOST || process.env.PIPELINE_API_HOST || options.thumbsHostname;
    options.thumbsPort = parseInt(process.env.PIPELINE_THUMBS_PORT) || parseInt(process.env.PIPELINE_API_PORT) || options.thumbsPort;
    options.thumbsPath = process.env.PIPELINE_THUMBS_PATH || options.thumbsPath;
    options.authRequired = process.env.PIPELINE_AUTH_REQUIRED !== "false";
    options.authUser = process.env.PIPELINE_AUTH_USER || options.authUser;
    options.authPassword = process.env.PIPELINE_AUTH_PASS || options.authPassword;
    options.name = process.env.PIPELINE_NAME || process.env.PIPELINE_COMPOSE_PROJECT || options.name;

    if (!isNullOrUndefined(process.env.PIPELINE_IS_ACTIVE) && process.env.PIPELINE_IS_ACTIVE.length > 0) {
        options.isActivePipeline = parseInt(process.env.PIPELINE_IS_ACTIVE) > 0;
    }

    return options;
}

export const Configuration = loadServerOptions();
