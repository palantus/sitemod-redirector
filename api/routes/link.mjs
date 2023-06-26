import express from "express"
import { lookupType } from "../../../../services/auth.mjs";
import RedirLink from "../../models/link.mjs";
const { Router, Request, Response } = express;
const route = Router();

export default (app) => {

  const route = Router();
  app.use("/l", route)

  route.get('/:id', lookupType(RedirLink, "redir"), (req, res, next) => {
    res.redirect(res.locals.redir.dest)
  });
};