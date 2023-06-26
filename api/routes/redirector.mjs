import express from "express"
import { lookupType, noGuest, permission } from "../../../../services/auth.mjs";
import RedirLink from "../../models/link.mjs";
const { Router, Request, Response } = express;
const route = Router();

export default (app) => {

  const route = Router();
  app.use("/redir", route)

  route.get('/', noGuest, permission("redirector.read"), (req, res, next) => {
    res.json(RedirLink.allByUser(res.locals.user).map(r => r.toObj()))
  });

  route.get('/:id', lookupType(RedirLink, "redir"), (req, res, next) => {
    res.json(res.locals.redir.toObj())
  });

  route.patch('/:id', permission("redirector.edit"), lookupType(RedirLink, "redir"), (req, res, next) => {
    if(req.body.dest !== undefined) res.locals.redir.dest = req.body.dest;
    res.json(res.locals.redir.toObj())
  });

  route.delete('/:id', permission("redirector.edit"), lookupType(RedirLink, "redir"), (req, res, next) => {
    res.locals.redir.delete();
    res.json({success: true})
  });

  route.post('/', noGuest, permission("redirector.edit"), (req, res, next) => {
    if(typeof req.body.id !== "string" || !req.body.id) throw "Missing id"
    let id = RedirLink.createId(req.body.id)
    if(RedirLink.lookup(id)) throw "Link already exists"
    let redir = new RedirLink({id, dest: req.body.dest || "", owner: res.locals.user})    
    res.json(redir.toObj())
  });
};