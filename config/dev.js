module.exports = {
  env: {
    NODE_ENV: '"development"',
  },
  defineConstants: {},
  mini: {},
  h5: {
    esnextModules: ["taro-ui"],
  },
  compiler: {
    type: "webpack5",
    prebundle: {
      enable: false,
      force: true,
      exclude: ["taro-ui"],
    },
  },
};
