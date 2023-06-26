import express from "express"
import { lookupType, noGuest, permission } from "../../../../services/auth.mjs";
import Redir from "../../models/redirect.mjs";
import RedirLink from "../../models/link.mjs";
const { Router, Request, Response } = express;
const route = Router();

export default (app) => {

  const route = Router();
  app.use("/redir", route)

  route.get('/:id/link', lookupType(Redir, "redir"), (req, res, next) => {
    res.json({link: res.locals.redir.userToLink(res.locals.user)?.dest||"/"})
  });

  route.get('/:id', lookupType(Redir, "redir"), (req, res, next) => {
    res.json(res.locals.redir.toObjFull())
  });

  route.get('/', noGuest, permission("redirector.read"), (req, res, next) => {
    res.json(Redir.allByUser(res.locals.user).map(r => r.toObj()))
  });

  route.patch('/:id', permission("redirector.edit"), lookupType(Redir, "redir"), (req, res, next) => {
    if(res.locals.redir.owner._id != res.locals.user._id) throw "You do not own this redirect";
    if(req.body.description !== undefined) res.locals.redir.description = req.body.description;
    res.json(res.locals.redir.toObj())
  });

  route.delete('/:id', permission("redirector.edit"), lookupType(Redir, "redir"), (req, res, next) => {
    if(res.locals.redir.owner._id != res.locals.user._id) throw "You do not own this redirect";
    res.locals.redir.delete();
    res.json({success: true})
  });

  route.post('/', noGuest, permission("redirector.edit"), (req, res, next) => {
    if(typeof req.body.id !== "string" || !req.body.id) throw "Missing id"
    let id = Redir.createId(req.body.id)
    if(Redir.lookup(id)) throw "Redirect Id already exists"
    let redir = new Redir({id, description: req.body.description || "", owner: res.locals.user})
    new RedirLink({redir, dest: req.body.dest||""})
    res.json(redir.toObj())
  });
};