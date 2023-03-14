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

const writeJsonData = async (path, json) => {
  try {
    const JSONStringify = JSON.stringify(json);
    await fs.writeFile(path, JSONStringify);
    console.log('Arquivo escrito com sucesso!');
  } catch (err) {
    console.error(`Erro ao escrever o arquivo: ${err.message}`);
  }
};

const validateWithRegex = (data, regex) => regex.test(data);

const validationLoginMiddleware = (req, res, next) => {
  const { email, password } = req.body;
  const isEmailValid = validateWithRegex(email, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
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

const validationTokenMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({ message: 'Token não encontrado' }); return;
  }
  const validateToken = authorization.length === 16 && typeof authorization === 'string';
  if (!validateToken) {
    res.status(401).json({ message: 'Token inválido' }); return;
  }
  next();
};

const validationNameMiddleware = (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: 'O campo "name" é obrigatório' }); return;
  }
  const isNameValid = name.length >= 3 && typeof name === 'string';
  if (!isNameValid) {
    res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' }); return;
  }
  next();
};

const validationAgeMiddleware = (req, res, next) => {
  const { age } = req.body;
  if (!age) {
    res.status(400).json({ message: 'O campo "age" é obrigatório' }); return;
  }
  const isAgeValid = Number.isInteger(age) && age >= 18;
  if (!isAgeValid) {
    res.status(400).json(
      { message: 'O campo "age" deve ser um número inteiro igual ou maior que 18' },
      ); return;
  }
  next();
};

const validationTalkAndWatchedMiddleware = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) {
    res.status(400).json({ message: 'O campo "talk" é obrigatório' }); return;
  }
  const { talk: { watchedAt } } = req.body;
  if (!watchedAt) {
    res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' }); return;
  }
  const validateWatchedAt = validateWithRegex(watchedAt, /^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!validateWatchedAt) {
    res.status(400).json(
      { message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' },
      ); return;
  }
  next();
};

const validationRateMiddleware = (req, res, next) => {
  const { talk: { rate } } = req.body;
  if (typeof rate === 'undefined') {
    res.status(400).json({ message: 'O campo "rate" é obrigatório' }); return;
  }
  const isRateValid = Number.isInteger(rate) && rate >= 1 && rate <= 5;
  if (!isRateValid) {
    res.status(400).json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' });
    return;
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

app.post('/login', validationLoginMiddleware, async (req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  res.status(200).json({ token });
});

app.post('/talker', validationTokenMiddleware,
 validationNameMiddleware, validationAgeMiddleware,
  validationTalkAndWatchedMiddleware, validationRateMiddleware, async (req, res) => {
  const newPerson = req.body;
  const registeredPersons = await readJsonData('src/talker.json');
  newPerson.id = registeredPersons.length + 1;
  registeredPersons.push(newPerson);
  await writeJsonData('src/talker.json', registeredPersons);
  res.status(201).json(newPerson);
});