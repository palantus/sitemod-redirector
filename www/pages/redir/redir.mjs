const elementName = 'redir-page'

import api from "/system/api.mjs"
import "/components/action-bar.mjs"
import "/components/action-bar-item.mjs"
import "/components/field-ref.mjs"
import "/components/field-edit-inline.mjs"
import {on, off} from "/system/events.mjs"
import { showDialog, confirmDialog } from "/components/dialog.mjs";
import { getApiConfig } from "/system/core.mjs"


const template = document.createElement('template');
template.innerHTML = `
  <link rel='stylesheet' href='/css/global.css'>
  <link rel='stylesheet' href='/css/searchresults.css'>
  <style>
    #container{
        padding: 10px;
    }
    table{
      margin-top: 5px;
    }
    table thead tr{
      border: 1px solid gray;
    }
    table tbody td, table thead th {
      padding-right: 8px;
    }

  </style>  

  <action-bar>
    <action-bar-item id="new-btn">New link</action-bar-item>
  </action-bar>
  
  <div id="container">
    <table>
        <thead>
            <tr>
              <th>Id</th>
              <th>Destination</th>
              <th>Short link</th>
              <th>Fast link</th>
              <th></th>
            </tr>
        </thead>
        <tbody id="redir" class="container">
        </tbody>
    </table>
  </div>

  <dialog-component title="New redirect" id="new-dialog">
    <field-component label="Id / name"><input id="new-id"></input></field-component>
    <field-component label="Destination"><input id="new-dest"></input></field-component>
  </dialog-component>
`;

class Element extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.refreshData = this.refreshData.bind(this);
    this.newItem = this.newItem.bind(this)
    this.copyLinkShort = this.copyLinkShort.bind(this)
    this.copyLinkShortest = this.copyLinkShortest.bind(this)
    this.deleteLink = this.deleteLink.bind(this)
    this.shadowRoot.getElementById("new-btn").addEventListener("click", this.newItem)

    this.shadowRoot.getElementById("redir").addEventListener("click", e => {
      let id = e.target.closest("tr").getAttribute("data-id")
      if(e.target.classList.contains("copy-short")){
        this.copyLinkShortest(id)
      } else if(e.target.classList.contains("copy-fast")){
        this.copyLinkShort(id)
      } else if(e.target.classList.contains("delete")){
        this.deleteLink(id)
      }
    })
  }
  async refreshData(){
    let apiConfig = await getApiConfig();
    let redir = this.redir = await api.get("redir")
    this.shadowRoot.getElementById("redir").innerHTML = redir.map(r => `
      <tr class="redir result" data-id="${r.id}">
        <td>${r.id}</td>
        <td><field-edit-inline type="text" patch="redir/${r.id}" field="dest" value="${r.dest}"></field-edit-inline></td>
        <td>${apiConfig.site}/l/${r.id}</td>
        <td>${apiConfig.api}/l/${r.id}</td>
        <td><button class="copy-short">Copy short link</button><button class="copy-fast">Copy fast link</button><button class="delete">Delete</button>
      </tr>
    `).join("")
  }

  newItem(){
    let dialog = this.shadowRoot.querySelector("#new-dialog")

    showDialog(dialog, {
      show: () => this.shadowRoot.querySelector("#new-id").focus(),
      ok: async (val) => {
        await api.post(`redir`, val)
        this.refreshData()
      },
      validate: async (val) => 
          !val.id ? "Please fill out Id"
        : !val.dest ? "Please fill out Destination"
        : true,
      values: () => {return {
        id: this.shadowRoot.getElementById("new-id").value,
        dest: this.shadowRoot.getElementById("new-dest").value,
      }},
      close: () => {
        this.shadowRoot.querySelectorAll("field-component input").forEach(e => e.value = '')
      }
    })
  }

  async copyLinkShort(id){
    let apiConfig = await getApiConfig();
    let redir = this.redir.find(r => r.id == id)
    if(!redir) return;
    navigator.clipboard.writeText(`${apiConfig.api}/l/${redir.id}`)
  }

  async copyLinkShortest(id){
    let apiConfig = await getApiConfig();
    let redir = this.redir.find(r => r.id == id)
    if(!redir) return;
    navigator.clipboard.writeText(`${apiConfig.site}/l/${redir.id}`)
  }

  async deleteLink(id){
    if(!(await confirmDialog("Are you sure?"))) return;
    await api.del(`redir/${id}`)
    this.refreshData()
  }

  connectedCallback() {
    on("changed-page", elementName, this.refreshData)
  }

  disconnectedCallback() {
    off("changed-page", elementName)
  }

}

window.customElements.define(elementName, Element);
export {Element, elementName as name}