const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadSampleData() {
  const dataFile = path.join(__dirname, "..", "js", "connectome-data.js");
  const source = fs.readFileSync(dataFile, "utf8");
  const context = {
    window: {}
  };

  vm.createContext(context);
  vm.runInContext(source, context, {
    filename: dataFile
  });

  return context.window.SynapseData;
}

module.exports = {
  loadSampleData
};
