const express = require('express');

const router = express.Router();

const { readJsonData, writeJsonData } = require('../utils/fs/jsonHandlers');

const talkerPath = 'src/talker.json';

const { validateQueryParamRate, validationTokenMiddleware, validationNameMiddleware,
validationAgeMiddleware, validationPersonMiddleware, validationTalkAndWatchedMiddleware,
validationRateMiddleware, validateQueryParamDate } = require('../middlewares');

const searchFilter = (talkers, searchTerm, searchRate, dateSearch) => {
    let newTalkers = talkers;
  
    if (searchTerm) {
     newTalkers = newTalkers.filter((talker) => talker.name.includes(searchTerm));
    }
  
    if (searchRate) {
      newTalkers = newTalkers.filter((talker) => talker.talk.rate === Number(searchRate));
    }

    if (dateSearch) {
        newTalkers = newTalkers.filter((talker) => talker.talk.watchedAt === dateSearch);
    }
  
    return newTalkers;
  };

router.get('/', async (req, res) => {
    const allRegisteredPersons = await readJsonData(talkerPath);
    
    if (allRegisteredPersons) {
      res.status(200).json(allRegisteredPersons);
      return;
    }
    res.status(200).json([]);
  });
  
  router.get('/search', validationTokenMiddleware,
   validateQueryParamRate, validateQueryParamDate, async (req, res) => {
    const { q: searchTerm, rate: rateSearch, date: dateSearch } = req.query;
    const allRegisteredPersons = await readJsonData(talkerPath);
  
    if (!searchTerm && !rateSearch && !dateSearch) {
      res.status(200).json(allRegisteredPersons);
      return;
    }
  
    const filteredPersons = searchFilter(allRegisteredPersons, searchTerm, rateSearch, dateSearch);
    if (!filteredPersons) {
      res.status(200).json([]);
      return;
    }
    res.status(200).json(filteredPersons);
  });
  
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
  
    const allRegisteredPersons = await readJsonData(talkerPath);
    const personOnId = allRegisteredPersons.find((person) => person.id === Number(id));
  
    if (personOnId) {
      res.status(200).json(personOnId);
      return;
    }
    res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  });

  router.post('/', validationTokenMiddleware,
 validationNameMiddleware, validationAgeMiddleware,
  validationTalkAndWatchedMiddleware, validationRateMiddleware, async (req, res) => {
  const newPerson = req.body;
  const registeredPersons = await readJsonData(talkerPath);
  newPerson.id = registeredPersons.length + 1;
  registeredPersons.push(newPerson);
  await writeJsonData(talkerPath, registeredPersons);
  res.status(201).json(newPerson);
});

router.put('/:id', validationTokenMiddleware, validationNameMiddleware,
validationAgeMiddleware, validationTalkAndWatchedMiddleware,
validationRateMiddleware, validationPersonMiddleware, async (req, res) => {
  const { id } = req.params;
  const updatePerson = req.body;
  updatePerson.id = Number(id);

  const registeredPersons = await readJsonData(talkerPath);
  const registeredPersonByIdIndex = registeredPersons.findIndex((person) => 
  person.id === Number(id));

  registeredPersons[registeredPersonByIdIndex] = updatePerson;
  await writeJsonData(talkerPath, registeredPersons);

  res.status(200).json(updatePerson);
});

router.delete('/:id', validationTokenMiddleware, async (req, res) => {
  const { id } = req.params;

  const registeredPersons = await readJsonData(talkerPath);
  const findPersonIndex = registeredPersons.findIndex((person) => person.id === Number(id));
  registeredPersons.splice(findPersonIndex, 1);
  await writeJsonData(talkerPath, registeredPersons);

  res.status(204).end();
});

module.exports = router;