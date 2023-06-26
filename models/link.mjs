import Entity, { query } from "entitystorage";
import User from "../../../models/user.mjs"

export default class RedirLink extends Entity{
  initNew({redir, dest}){
    redir.rel(this, "link")
    this.dest = dest
    this.public = false
    this.orderIdx = redir.links.reduce((max, cur) => Math.max(cur.orderIdx||0, max), 0) + 1;
    this.tag("redirlink")
  }

  static lookup(id){
    if(!id) return null;
    return query.type(RedirLink).tag("redirlink").id(id).first
  }

  toObj(){
    return {
      id: this._id,
      public: !!this.public,
      dest: this.dest,
      role: this.related.role?.id||null,
      permission: this.related.permission?.id||null,
      user: this.related.user?.id||null,
      orderIdx: this.orderIdx||this._id
    }
  }
}