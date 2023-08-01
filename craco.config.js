const CracoLessPlugin = require("craco-less");
//기본 #0e62b1
//봄 #c77b7e
//여름 #24a35d
//가을 #af7840
//겨울 #b93530

let curMonth = new Date().getMonth() + 1;
let color;
if (curMonth >= 12 || curMonth <= 2) {
  color = 0;
}
if (curMonth >= 3 && curMonth <= 5) {
  color = 1;
}
if (curMonth >= 6 && curMonth <= 8) {
  color = 2;
}
if (curMonth >= 9 && curMonth <= 11) {
  color = 3;
}
const colorArr = ["#b93530", "#c77b7e", "#24a35d", "#af7840"];

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { "@primary-color": `${colorArr[color]}` },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
