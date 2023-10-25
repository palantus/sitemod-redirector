const elementName = 'redir-l-page'

import api from "../../system/api.mjs"
import {state, goto} from "../../system/core.mjs"

const template = document.createElement('template');
template.innerHTML = ``;

class Element extends HTMLElement {
  connectedCallback() {
    let pageId = /\/l\/([a-zA-Z0-9\-]+)/.exec(state().path)?.[1]
    api.get(`redir/${pageId}/link`).then(({link}) => {
      if(!link){
        alert("Invalid redirection")
        setTimeout(() => window.location = "/", 5000)
        return;
      }
      if(link.startsWith("/"))
        goto(link)
      else
        window.location = link
    })
  }
}

window.customElements.define(elementName, Element);
export {Element, elementName as name}