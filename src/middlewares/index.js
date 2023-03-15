const { readJsonData } = require('../utils/fs/jsonHandlers');

const talkerPath = 'src/talker.json';
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

  const validationRateMiddlewareUpdate = (req, res, next) => {
    const { rate } = req.body;
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
  
  const validationPersonMiddleware = async (req, res, next) => {
    const { id } = req.params;
    const registeredPersons = await readJsonData(talkerPath);
  
    const registeredPersonById = registeredPersons.find((person) => person.id === Number(id));
    if (typeof registeredPersonById === 'undefined') {
      res.status(404).json({ message: 'Pessoa palestrante não encontrada' }); return;
    }
    next();
  };
  
  const validateQueryParamRate = (req, res, next) => {
    const rateSearch = req.query.rate;
  
    if (rateSearch) {
    const validateRate = Number.isInteger(Number(rateSearch)) && rateSearch >= 1 && rateSearch <= 5;
    if (!validateRate) {
      res.status(400).json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' });
      console.log('entrei');
      return;
    }
  }
    next();
  };

  const validateQueryParamDate = (req, res, next) => {
    const { date } = req.query;
    if (date) {
        const validateWatchedAt = validateWithRegex(date, /^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!validateWatchedAt) {
            res.status(400).json(
                { message: 'O parâmetro "date" deve ter o formato "dd/mm/aaaa"' },
                );
                return;
        }
    }
    next();
  };

  module.exports = {
    validateQueryParamRate,
    validationAgeMiddleware,
    validationLoginMiddleware,
    validationNameMiddleware,
    validationPersonMiddleware,
    validationRateMiddleware,
    validationTalkAndWatchedMiddleware,
    validationTokenMiddleware,
    validateQueryParamDate,
    validationRateMiddlewareUpdate,
  };