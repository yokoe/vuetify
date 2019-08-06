// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');

module.exports = async ({ config }) => {
  config.resolve.alias['~storybook'] = path.resolve(__dirname)

  // config.module.rules.push({
  //   test: /\.vue$/,
  //   loader: 'storybook-addon-vue-info/loader',
  //   enforce: 'post'
  // });

  // config.module.rules.push({
  //   test: /\.s[ac]ss$/,
  //   use: [
  //     'style-loader',
  //     'css-loader',
  //     {
  //       loader: 'sass-loader',
  //       options: {
  //         implementation: require('sass')
  //       }
  //     }
  //   ]
  // });

  return config;
};
