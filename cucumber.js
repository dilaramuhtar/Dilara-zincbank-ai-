module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    requireModule: ["ts-node/register"],
    require: ["utilities/world.ts", "utilities/hooks.ts", "steps/**/*.ts"],
    format: ["progress-bar", "summary", "allure-cucumberjs/reporter"],
    formatOptions: {
      resultsDir: "allure-results",
    },
    publishQuiet: true,
    parallel: 1,
    retry: 0,
  },
};
