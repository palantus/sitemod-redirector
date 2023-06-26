import Entity, { query } from "entitystorage";
import User from "../../../models/user.mjs"

export default class RedirLink extends Entity{
  initNew({id, dest, owner}){
    this.id = id
    this.dest = dest
    this.rel(owner, "owner")
    this.tag("redirlink")
  }

  static lookup(id){
    if(!id) return null;
    return query.type(RedirLink).tag("redirlink").prop("id", id).first
  }

  static all(){
    return query.type(RedirLink).tag("redirlink").all
  }

  static allByUser(owner){
    return query.type(RedirLink).tag("redirlink").relatedTo(owner, "owner").all
  }

  owner(){
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

  toObj(){
    return {
      id: this.id,
      dest: this.dest,
      owner: this.owner()?.toObjSimple() || null
    }
  }
}