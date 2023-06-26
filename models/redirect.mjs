import Entity, { query } from "entitystorage";
import User from "../../../models/user.mjs"
import RedirLink from "./link.mjs";

export default class Redir extends Entity{
  initNew({id, description, owner}){
    this.id = id
    this.description = description
    this.rel(owner, "owner")
    this.tag("redir")
  }

  static lookup(id){
    if(!id) return null;
    return query.type(Redir).tag("redir").prop("id", id).first
  }

  static all(){
    return query.type(Redir).tag("redir").all
  }

  static allByUser(owner){
    return query.type(Redir).tag("redir").relatedTo(owner, "owner").all
  }

  get owner(){
    return User.from(this.related.owner)
  }

  static createId(id){
    return id.replace(/^\s+|\s+$/g, '') // trim
             .toLowerCase()
             .replace(/\//g, '-') //Replace / with -
             .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
             .replace(/\s+/g, '-') // collapse whitespace and replace by -
             .replace(/-+/g, '-'); // collapse dashes
  }

  get links(){
    return this.rels.link?.map(l => RedirLink.from(l))||[]
  }

  userToLink(user){
    let links = this.links.sort((a, b) => a.orderIdx < b.orderIdx ? -1 : 1)
    for(let link of links){
      if(!user && !link.public) continue;
      let userFilter = User.from(link.related.user);
      if(userFilter && userFilter.id != user.id) continue;
      let permissionIdFilter = link.related.permission?.id
      if(permissionIdFilter && !user.hasPermission(permissionIdFilter)) continue;
      let roleIdFilter = link.related.role?.id
      if(roleIdFilter && !user.roles.includes(roleIdFilter)) continue;
      return link
    }
  }

  toObj(){
    return {
      id: this.id,
      description: this.description,
      owner: this.owner?.toObjSimple() || null
    }
  }

  toObjFull(){
    return {
      id: this.id,
      description: this.description,
      owner: this.owner?.toObjSimple() || null,
      links: this.links.map(l => l.toObj())
    }
  }
}