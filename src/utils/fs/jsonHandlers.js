const fs = require('fs').promises;

const readJsonData = async (path) => {
    try {
        const data = await fs.readFile(path);
        const parsedData = JSON.parse(data);
        return parsedData;
    } catch (error) {
        console.error(`Erro na escrita do arquivo: ${error}`);
    }
};

const writeJsonData = async (path, json) => {
  try {
    const JSONStringify = JSON.stringify(json);
    await fs.writeFile(path, JSONStringify);
    console.log('Arquivo escrito com sucesso!');
  } catch (err) {
    console.error(`Erro ao escrever o arquivo: ${err.message}`);
  }
};

module.exports = {
    readJsonData,
    writeJsonData,
};