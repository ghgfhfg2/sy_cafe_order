const CracoLessPlugin = require('craco-less');

//봄 #c77b7e
//여름 #24a35d


module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#24a35d' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};