import Entity, { query } from "entitystorage";

export default class Setup extends Entity{
  initNew(){
    this.tag("redirsetup")
  }

  static lookup(){
    return query.type(Setup).tag("redirsetup").first || new Setup()
  }



  toObj(){
    return {
    }
  }
}