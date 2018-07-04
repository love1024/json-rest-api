const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const uuid = require('uuid/v1');

const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.all("*", (req, res) => {
  const method = req.method;
  const params = req.url.split("/");
  const name = params[1];
  const id = params[2];

  res.header("Content-Type", 'application/json');
  if (method == "GET" && id) {
    getDataById(name, id, res);
  } else if (method == "GET") {
    getData(name, res);
  } else if (method == "POST") {
    postData(name, req.body, res);
  } else if (method == "DELETE") {
    deleteData(name, id, res);
  } else if (method == "PUT") {
    updateData(name, req.body, id, res);
  }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({ error: err });
});

module.exports = app;

/** GET DATA */
function getData(name, res) {
  const path = "./data/" + name + ".json";
  if (fs.existsSync(path, 'utf-8')) {
    const fileData = fs.readFileSync(path);
    const parseData = JSON.parse(fileData);
    const response = JSON.stringify(parseData[name]);
    res.json(response);
  } else {
    createFile(name, () => {
      const fileData = fs.readFileSync(path);
      const parseData = JSON.parse(fileData);
      const response = JSON.stringify(parseData[name]);
      res.json(response);
    });
  }
}

/** GET DATA BY ID */
function getDataById(name, id, res) {
  const path = "./data/" + name + ".json";
  if (fs.existsSync(path, 'utf-8')) {
    const fileData = fs.readFileSync(path);
    const parseData = JSON.parse(fileData);
    const response = JSON.stringify(parseData[name].filter((item) => { return item.id == id }));
    res.json(response);
  } else {
    createFile(name, () => {
      const fileData = fs.readFileSync(path);
      const parseData = JSON.parse(fileData);
      const response = JSON.stringify(parseData[name].filter((item) => { return item.id == id }));
      res.json(response);
    });
  }
}

/** SAVE DATA */
function postData(name, data, res) {
  const path = "./data/" + name + ".json";

  if (fs.existsSync(path, 'utf-8')) {
    const fileData = fs.readFileSync(path);
    const parseData = JSON.parse(fileData);
    parseData.maxId = parseInt(parseData.maxId) + 1;
    data.id = parseData.maxId;
    parseData[name].push(data);
    const response = JSON.stringify(data);
    res.json(response);
    fs.writeFileSync(path, JSON.stringify(parseData));
  } else {
    createFile(name, () => {
      const fileData = fs.readFileSync(path);
      const parseData = JSON.parse(fileData);
      data.id = parseData.maxId;
      parseData[name].push(data);
      const response = JSON.stringify(data);
      res.json(response);
      fs.writeFileSync(path, JSON.stringify(parseData));
    });
  }
}

/** DELETE DATA */
function deleteData(name, id, res) {
  const path = "./data/" + name + ".json";
  if (fs.existsSync(path, 'utf-8')) {
    const fileData = fs.readFileSync(path);
    const parseData = JSON.parse(fileData);
    const response = parseData[name].filter((item) => { return item.id != id });
    res.json(JSON.stringify({ result: "sucess" }));
    parseData[name] = response;
    fs.writeFileSync(path, JSON.stringify(parseData));
  } else {
    createFile(name, () => {
      const fileData = fs.readFileSync(path);
      const parseData = JSON.parse(fileData);
      const response = parseData[name].filter((item) => { return item.id != id });
      res.json(JSON.stringify({ result: "sucess" }));
      parseData[name] = response;
      fs.writeFileSync(path, JSON.stringify(parseData));
    });
  }
}

function updateData(name, data, id, res) {
  const path = "./data/" + name + ".json";
  data.id = id;
  if (fs.existsSync(path, 'utf-8')) {
    const fileData = fs.readFileSync(path);
    const parseData = JSON.parse(fileData);
    const response = parseData[name].map((item) => { return item.id == id ? data : item });
    res.json(JSON.stringify(data));
    parseData[name] = response;
    fs.writeFileSync(path, JSON.stringify(parseData));
  } else {
    createFile(name, () => {
      const fileData = fs.readFileSync(path);
      const parseData = JSON.parse(fileData);
      const response = parseData[name].map((item) => { return item.id == id ? data : item });
      res.json(JSON.stringify(data));
      parseData[name] = response;
      fs.writeFileSync(path, JSON.stringify(parseData));
    });
  }
}

/** CREATE NEW FILE */
function createFile(name, cb) {
  const path = "./data/" + name + ".json";
  const data = { [name]: [], maxId: 1 };
  fs.writeFile(path, JSON.stringify(data), { flag: 'wx' }, function (err) {
    if (err) throw err;
    console.log("file created");
    cb();
  });
}
