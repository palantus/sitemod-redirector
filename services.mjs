import Role from "../../models/role.mjs"

export default async () => {

    // init
    Role.lookupOrCreate("admin").addPermission(["redirector.read", "redirector.edit"], true)

    return {}
}