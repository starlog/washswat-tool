'use strict'
let http = require("./interface/httpclient")
let mongo = require("./interface/mongodb")
let util2 = require("./util/util2")
let log4j = require("log4js");
let logger = log4j.getLogger("config.js");

let configQuery = {
    method: "get",
    url: "https://config.internal.washswat.com/v1/config/domain/$1/service/$2",
    params: {},
    timeout: 3000,
    useRedis: false,
    RedisTtl: 100,
};
const retryConfig = {
    time: 3,
    interval: 10,
};
const mongoConnections = [
    {
        name: 'config',
        url: 'mongodb://'
            + 'washswat:!Washswat101@washswat.mongo.internal:27017'
            + '?replicaSet=rs0&readPreference=secondaryPreferred',
        options: {
            maxPoolSize: 2,
            connectTimeoutMS: 2000
        },
        useRedis: true,
        RedisTtl: 60
    }
];
let queryObject = {
    name: 'config',
    db: 'configuration',
    collection: 'platform',
    query: {},
    fields: {},
    sort: {version: -1},
    skip: 0,
    limit: 1
};

let _config;
let _platformConfig;
let _appConfig;

///////////////////////////////////////////////////////////////////////////////////////////////////
exports.configure = function (domain, app, packageJson, loglevel, callback) {
    util2.setLogLevel2(loglevel);
    logger.level = loglevel;
    _appConfig = packageJson;
    configQuery.url = configQuery.url.replace('$1', domain).replace('$2', app);
    http.call(configQuery, retryConfig, function (err, result) {
        if (!err) {
            _config = result.data;
            logger.debug('_config:' + JSON.stringify(_config));
            mongo.init(mongoConnections, function (err, result) {
                if (!err) {
                    mongo.find(queryObject, function (err, mongoResult) {
                        if (!err) {
                            _platformConfig = mongoResult;
                            logger.debug('configre:_platformConfig:' + JSON.stringify(_platformConfig));
                            callback(null);
                        }
                        else {
                            callback('configure:mongo' + err);
                        }
                    })
                }
                else {
                    callback('configure:mongo:init err:' + err);
                }
            })
        }
        else {
            logger.error('felix-tool init error:' + err);
            callback(err);
        }
    });
}
///////////////////////////////////////////////////////////////////////////////////////////////////
exports.getAppConfig = function () {
    return (_appConfig);
}
exports.getGlobalGatewayUrl = function () {
    return _config.common['apigateway'].url;
}
exports.getPlatformConfig = function () {
    return _platformConfig[0];
}
///////////////////////////////////////////////////////////////////////////////////////////////////
exports.readPlatformConfig = async function () {
    return new Promise(function (resolve, reject) {
        mongo.find(queryObject, function (err, mongoResult) {
            if (!err) {
                _platformConfig = mongoResult;
                logger.debug('configre:_platformConfig:' + JSON.stringify(_platformConfig));
                resolve(_platformConfig[0]);
            }
            else {
                reject('configure:mongo' + err);
            }
        })
    })
}
///////////////////////////////////////////////////////////////////////////////////////////////////
exports.setHeader = function (response) {
    response.setHeader('x-washswat-environment', _config.common.environment);
    response.setHeader('x-washswat-version', _appConfig.name + ':' + _appConfig.version);
    response.setHeader('Access-Control-Allow-Origin', '*'); // CORS Allow all
}
