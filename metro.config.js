const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Drizzle 마이그레이션 파일(.sql)을 import할 수 있게 한다.
config.resolver.sourceExts.push('sql');

module.exports = config;
