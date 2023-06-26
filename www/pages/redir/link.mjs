const elementName = 'sample-page'

import api from "/system/api.mjs"
import {state} from "/system/core.mjs"

const template = document.createElement('template');
template.innerHTML = ``;

class Element extends HTMLElement {
  connectedCallback() {
    let pageId = /\/l\/([a-zA-Z0-9\-]+)/.exec(state().path)?.[1]
    api.get(`redir/${pageId}`).then(redir => {
      if(!redir){
        alert("Invalid redirection")
        setTimeout(() => window.location = "/", 5000)
      }
      window.location = redir.dest
    })
  }
}

window.customElements.define(elementName, Element);
export {Element, elementName as name}