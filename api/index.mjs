import redir from './routes/redirection.mjs';
import setup from './routes/setup.mjs';
import redirect from './routes/redirect.mjs';
import link from './routes/link.mjs';

export default (app, graphQLFields) => {

  setup(app)
  redir(app)
  redirect(app)
  link(app)
  
  return app
}