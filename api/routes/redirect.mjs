import express from "express"
import { lookupType } from "../../../../services/auth.mjs";
import Redir from "../../models/redirect.mjs";
const { Router, Request, Response } = express;
const route = Router();

export default (app) => {

  const route = Router();
  app.use("/l", route)

  route.get('/:id', lookupType(Redir, "redir"), (req, res, next) => {
    res.redirect(res.locals.redir.userToLink(res.locals.user)?.dest||"/")
  });
};