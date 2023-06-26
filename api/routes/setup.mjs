import express from "express"
const { Router, Request, Response } = express;
const route = Router();

export default (app) => {

  const route = Router();
  app.use("/redir/setup", route)

  route.get('/', function (req, res, next) {
    res.json({message: "Hello World!"})
  });
};