const CracoLessPlugin = require("craco-less");

//봄 #c77b7e
//여름 #24a35d
//가을 #af7840
//겨울 #b93530

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { "@primary-color": "#b93530" },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
