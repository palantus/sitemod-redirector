routes.push(...[
  {path: "/redir",              page: "/pages/redir/redir.mjs"},
  {path: "/redirector/setup",   page: "/pages/redir/setup.mjs"},

  {regexp: /^\/l\/([a-zA-Z0-9\-]+)/,    page: "../pages/redir/link.mjs", publicAccess: true}
])