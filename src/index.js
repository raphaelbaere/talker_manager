const express = require('express');

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

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker', async (req, res) => {
  const allRegisteredPersons = await readJsonData('src/talker.json');
  
  if (allRegisteredPersons) {
    res.status(200).json(allRegisteredPersons);
    return;
  }
  res.status(200).json([]);
});