import redir from './routes/redirector.mjs';
import setup from './routes/setup.mjs';
import link from './routes/link.mjs';

export default (app, graphQLFields) => {

  setup(app)
  redir(app)
  link(app)
  
  return app
}