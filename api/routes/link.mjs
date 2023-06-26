import express from "express"
import { lookupType, noGuest, permission } from "../../../../services/auth.mjs";
import Redir from "../../models/redirect.mjs";
import RedirLink from "../../models/link.mjs";
import Permission from "../../../../models/permission.mjs";
import Role from "../../../../models/role.mjs";
import User from "../../../../models/user.mjs";
const { Router, Request, Response } = express;
const route = Router();

export default (app) => {

  const route = Router();
  app.use("/redir/:id/links", permission("redirector.read"), lookupType(Redir, "redir"), route)

  route.get('/', (req, res, next) => {
    res.json(res.locals.redir.links.map(l => l.toObj()))
  });

  route.get('/:id', lookupType(RedirLink, "link"), (req, res, next) => {
    res.json(res.locals.link.toObj())
  });

  route.patch('/:id', permission("redirector.edit"), lookupType(RedirLink, "link"), (req, res, next) => {
    if(res.locals.redir.owner._id != res.locals.user._id) throw "You do not own this redirect";
    if(req.body.public !== undefined) res.locals.link.public = !!req.body.public;
    if(req.body.dest !== undefined && req.body.dest) res.locals.link.dest = req.body.dest;
    if(req.body.permission !== undefined) res.locals.link.rel(Permission.lookup(req.body.permission), "permission", true);
    if(req.body.role !== undefined) res.locals.link.rel(Role.lookup(req.body.role), "role", true);
    if(req.body.user !== undefined) res.locals.link.rel(User.lookup(req.body.user), "user", true);
    if(typeof req.body.orderIdx === "number") res.locals.link.orderIdx = req.body.orderIdx
    res.json(res.locals.redir.toObj())
  });

  route.delete('/:id', permission("redirector.edit"), lookupType(RedirLink, "link"), (req, res, next) => {
    if(res.locals.redir.owner._id != res.locals.user._id) throw "You do not own this redirect";
    res.locals.link.delete();
    res.json({success: true})
  });

  route.post('/', noGuest, permission("redirector.edit"), (req, res, next) => {
    let lastLink = res.locals.redir.links.pop()
    res.json(new RedirLink({redir: res.locals.redir, dest: lastLink?.dest||"/"}).toObj())
  });
};