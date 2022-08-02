'use strict'
let http = require("../interface/httpclient")
let mongo = require("../interface/mongodb")
let util2 = require("../util/util2")
let log4j = require("log4js");
let logger = log4j.getLogger("api.js");
let config = require('../configuration/config');

const retryConfig = {
    time: 3,
    interval: 10,
};
///////////////////////////////////////////////////////////////////////////////////////////////////
exports.getUidFromAuthentication = async function (xWashswatToken) {
    let configQuery = {
        method: "get",
        url: config.getGlobalGatewayUrl() + "/authentication/v1/admin/verify",
        params: {},
        timeout: 3000,
        useRedis: false,
        RedisTtl: 100,
        headers: {
            "x-washswat-token": xWashswatToken,
        },
    };
    return new Promise(function (resolve, reject) {
        http.call(configQuery, retryConfig, function (err, result) {
            if (err) {
                reject(err);
            }
            else if (result.data.common.status !== 'success') {
                reject("Error:getUidFromAuthentication" + JSON.stringify(result.data));
            }
            else {
                resolve(result.data);
            }
        });
    });
}
///////////////////////////////////////////////////////////////////////////////////////////////////
exports.getAuthenticationFromUid = async function (uid) {
    let configQuery = {
        method: "post",
        url: config.getGlobalGatewayUrl() + "/authentication/v1/admin/create",
        params: {},
        timeout: 3000,
        useRedis: false,
        RedisTtl: 100,
        data: {
            data: {
                uid: uid
            }
        }
    };
    return new Promise(function (resolve, reject) {
        http.call(configQuery, retryConfig, function (err, result) {
            if (err) {
                reject(err);
            }
            else if (result.data.common.status !== 'success') {
                reject("Error:getAuthenticationFromUid" + JSON.stringify(result.data));
            }
            else {
                resolve(result.data);
            }
        });
    });
}
