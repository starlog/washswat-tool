'use strict'

let washswat_tool = {
    interface: {
        emergency: require('./lib/interface/emergency'),
        httpclient: require('./lib/interface/httpclient'),
        mongodb: require('./lib/interface/mongodb'),
        redisCache: require('./lib/interface/redisCache'),
        redisCacheMulti: require('./lib/interface/redisCacheMulti'),
    },
    util: {
        circuitbreaker: require('./lib/util/circuitBreaker'),
        lap: require('./lib/util/lap'),
        util2: require('./lib/util/util2'),
        emergency: require('./lib/util/emergency')
    },
    api: require('./lib/api'),
    config: require('./lib/config')
};

module.exports = washswat_tool;
