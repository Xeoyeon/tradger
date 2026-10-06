module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Drizzle 마이그레이션(.sql)을 번들에 문자열로 포함
      ['inline-import', { extensions: ['.sql'] }],
      ['react-native-unistyles/plugin', { root: 'src' }],
    ],
  };
};
