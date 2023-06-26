const elementName = 'redirlink-page'

import api from "/system/api.mjs"
import "/components/field-ref.mjs"
import "/components/field-edit-inline.mjs"
import "/components/field-list.mjs"
import {on, off} from "/system/events.mjs"
import { getApiConfig, state } from "/system/core.mjs"


const template = document.createElement('template');
template.innerHTML = `
  <link rel='stylesheet' href='/css/global.css'>
  <link rel='stylesheet' href='/css/searchresults.css'>
  <style>
    field-list{
      width: 500px;
    }
    field-list button{
      margin-left: 10px;
      margin-right: 10px;
    }
    #short{width: 300px;}
    #fast{width: 300px;}
  </style>  

  <div id="container">
    <field-list labels-pct="20">
      <field-edit type="text" label="Id" id="id" disabled></field-edit>
      <field-edit type="text" label="Description" id="description"></field-edit>
      <span><field-edit type="text" label="Short URL" id="short" disabled></field-edit><button id="copy-short">Copy</button></span>
      <span><field-edit type="text" label="Fast URL" id="fast" disabled></field-edit><button id="copy-fast">Copy</button><span><br>Fast URL only works for public links</span></span>
    </field-list>

    <br>
    <h3>Targets:</h3>

    <table>
      <thead>
        <tr>
          <th>Order</th>
          <th>Target</th>
          <th>Public</th>
          <th>Role</th>
          <th>Permission</th>
          <th>User</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="links" class="container">
      </tbody>
    </table>
    <button id="new-btn" class="styled">New link</button>
    <button id="refresh-btn" class="styled">Refresh</button>

  </div>
`;

class Element extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.refreshData = this.refreshData.bind(this);
    this.deleteLink = this.deleteLink.bind(this)

    this.redirId = this.getAttribute("redir") || /\/l\/([a-zA-Z0-9\-]+)/.exec(state().path)?.[1]

    this.shadowRoot.getElementById("copy-short").addEventListener("click", async () => {
      let apiConfig = await getApiConfig();
      navigator.clipboard.writeText(`${apiConfig.site}/l/${this.redir.id}`)
    })

    this.shadowRoot.getElementById("copy-fast").addEventListener("click", async () => {
      let apiConfig = await getApiConfig();
      navigator.clipboard.writeText(`${apiConfig.api}/l/${this.redir.id}`)
    })

    this.shadowRoot.getElementById("links").addEventListener("click", e => {
      let id = e.target.closest("tr").getAttribute("data-id")
      if(e.target.classList.contains("delete")){
        this.deleteLink(id)
      }
    })

    this.shadowRoot.getElementById("new-btn").addEventListener("click", async () => {
      await api.post(`redir/${this.redirId}/links`)
      this.refreshData();
    })

    this.shadowRoot.getElementById("refresh-btn").addEventListener("click", this.refreshData)
  }
  async refreshData(){
    if(!this.redirId) return;
    let apiConfig = await getApiConfig();
    let redir = this.redir = await api.get(`redir/${this.redirId}`)

    this.shadowRoot.getElementById("id").setAttribute("value", redir.id)
    this.shadowRoot.getElementById("description").setAttribute("value", redir.description)
    this.shadowRoot.getElementById("short").setAttribute("value", `${apiConfig.site}/l/${redir.id}`)
    this.shadowRoot.getElementById("fast").setAttribute("value", `${apiConfig.api}/l/${redir.id}`)

    this.shadowRoot.querySelectorAll("field-edit:not([disabled])").forEach(e => e.setAttribute("patch", `redir/${redir.id}`));
    
    this.shadowRoot.getElementById("links").innerHTML = redir.links.sort((a, b) => a.orderIdx < b.orderIdx ? -1 : 1).map(r => `
      <tr class="redir result" data-id="${r.id}">
        <td><field-edit-inline type="number" patch="redir/${this.redir.id}/links/${r.id}" field="orderIdx" value="${r.orderIdx}"></field-edit-inline></td>
        <td><field-edit-inline type="text" patch="redir/${this.redir.id}/links/${r.id}" field="dest" value="${r.dest}"></field-edit-inline></td>
        <td><field-edit type="checkbox" patch="redir/${this.redir.id}/links/${r.id}" field="public" value="${r.public}"></field-edit></td>
        <td><field-edit-inline type="select" patch="redir/${this.redir.id}/links/${r.id}" field="role" lookup="role" value="${r.role||""}"></field-edit-inline></td>
        <td><field-edit-inline type="select" patch="redir/${this.redir.id}/links/${r.id}" field="permission" lookup="permission" value="${r.permission||""}"></field-edit-inline></td>
        <td><field-edit-inline type="select" patch="redir/${this.redir.id}/links/${r.id}" field="user" lookup="user" value="${r.user||""}"></field-edit-inline></td>
        <td><button class="delete">Delete</button></td>
      </tr>
    `).join("")
  }

  async deleteLink(id){
    let link = this.redir.links.find(r => r.id == id)
    if(!link) return;
    await api.del(`redir/${this.redir.id}/links/${link.id}`)
    this.refreshData()
  }

  connectedCallback() {
    on("changed-page", elementName, this.refreshData)
  }

  disconnectedCallback() {
    off("changed-page", elementName)
  }

  static get observedAttributes() {
    return ["redir"];
  }  

  attributeChangedCallback(name, oldValue, newValue) {
    switch(name){
      case "redir":
        if(newValue) {
          this.redirId = newValue;
          this.refreshData();
        }
      break;
    }
  }
}

window.customElements.define(elementName, Element);
export {Element, elementName as name}