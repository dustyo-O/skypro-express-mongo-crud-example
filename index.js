const express = require('express');
const pug = require('pug');
const { ObjectId, MongoClient } = require('mongodb');

let client;

const app = express();
const port = 3000;

app.use(express.urlencoded());

app.use(function(req, res, next) {
  if (!client) {
    const url = 'mongodb://localhost:27017';

    MongoClient.connect(url).then((mongoClient) => {
      console.log(`MongoDB connected on ${url}`);
      client = mongoClient;

      req.client = client;

      next();
    });

    return;
  }

  req.client = client;

  next();
});

app.get('/', async (req, res) => {
  const { client } = req;

  const db = client.db('tasks');
  const collection = db.collection("tasks");

  const dbTaskList = await collection.find({}).toArray();
  const taskList = dbTaskList.map(task => ({
    id: task._id.toString(),
    title: task.title,
    description: task.description,
  }));

  console.log(taskList);

  const indexFunction = pug.compileFile('templates/index.pug');

  const indexHtml = indexFunction({
    tasks: taskList
  });

  res.send(indexHtml);
});

app.get('/task/:id', async (req, res) => {
  const id = req.params.id;

  const db = client.db('tasks');
  const collection = db.collection("tasks");

  const dbTask = await collection.findOne({
    _id: ObjectId("617137a8a3318030665aacad")
  });

  const task = {
    id: dbTask._id.toString(),
    title: dbTask.title,
    description: dbTask.description,
  }

  const taskFunction = pug.compileFile('templates/task.pug');

  const taskHtml = taskFunction({
    task
  });

  res.send(taskHtml);
});

app.get('/task/edit/:id', async (req, res) => {
  const id = req.params.id;

  const db = client.db('tasks');
  const collection = db.collection("tasks");

  const dbTask = await collection.findOne({
    _id: ObjectId("617137a8a3318030665aacad")
  });

  const task = {
    id: dbTask._id.toString(),
    title: dbTask.title,
    description: dbTask.description,
  }

  const editFunction = pug.compileFile('templates/edit.pug');

  const editHtml = editFunction({
    task
  });

  res.send(editHtml);
});

app.get('/new-task', async (req, res) => {
  const createFunction = pug.compileFile('templates/create.pug');

  const createHtml = createFunction();

  res.send(createHtml);
});

app.post('/task-create', async (req, res) => {
  const doc = req.body;

  const db = client.db('tasks');
  const collection = db.collection("tasks");

  const result = await collection.insertOne(doc);

  res.redirect('/');
});

app.post('/task-update', async (req, res) => {
  const doc = {
    title: req.body.title,
    description: req.body.description
  };

  const _id = new ObjectId(req.body.id);

  const db = client.db('tasks');
  const collection = db.collection("tasks");

  await collection.updateOne({ _id }, { $set: doc });

  res.redirect('/task/' + req.body.id);
});


  // collection.findOne({
  //   _id: ObjectId("617137a8a3318030665aacad")
  // }).then((result) => {
  //   console.log(result);
  // });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
