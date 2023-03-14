const express = require('express');

const fs = require('fs').promises;

const crypto = require('crypto');

const readJsonData = async (path) => {
    try {
        const data = await fs.readFile(path);
        const parsedData = JSON.parse(data);
        return parsedData;
    } catch (error) {
        console.error(`Erro na escrita do arquivo: ${error}`);
    }
};

const validateEmail = (email, regex) => regex.test(email);

const validationMiddleware = (req, res, next) => {
  const { email, password } = req.body;
  const isEmailValid = validateEmail(email, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  if (!email) {
    res.status(400).json({ message: 'O campo "email" é obrigatório' }); return;
  }
  if (!isEmailValid) {
    res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' }); return;
  }
  if (!password) {
    res.status(400).json({ message: 'O campo "password" é obrigatório' }); return;
  }
  const isPasswordValid = password.length >= 6;
  if (!isPasswordValid) {
    res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' }); return;
  }
  next();
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

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;

  const allRegisteredPersons = await readJsonData('src/talker.json');
  const personOnId = allRegisteredPersons.find((person) => person.id === Number(id));

  if (personOnId) {
    res.status(200).json(personOnId);
    return;
  }
  res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
});

app.post('/login', validationMiddleware, async (req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  res.status(200).json({ token });
});