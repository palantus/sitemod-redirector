const elementName = 'redir-page'

import api from "/system/api.mjs"
import "/components/action-bar.mjs"
import "/components/action-bar-item.mjs"
import "/components/field-ref.mjs"
import "/components/field-edit-inline.mjs"
import "/pages/redir/redirlink.mjs"
import {on, off} from "/system/events.mjs"
import { showDialog, confirmDialog } from "/components/dialog.mjs";
import { getApiConfig } from "/system/core.mjs"


const template = document.createElement('template');
template.innerHTML = `
  <link rel='stylesheet' href='/css/global.css'>
  <link rel='stylesheet' href='/css/searchresults.css'>
  <style>

    #container{
        position: relative;
        display: grid;
        grid-template-areas:'left right';
        grid-gap: 0px;
        width: 100%;
        height: 100%;
        grid-template-columns: 500px auto;
    }
    @media only screen and (max-width: 1100px) {
      #container{
        display: initial !important;
      }
    }

    #linktab {margin-top: 5px;}
    #linktab thead th:nth-child(1){width: 85px}
    #linktab thead th:nth-child(2){width: 120px}
    #linktab thead tr{border-bottom: 1px solid gray;}

    #left{grid-area: left; border-right: 1px solid gray;overflow-y: auto;}
    #right{grid-area: right; padding: 5px; overflow-y: auto}
    .result:hover{/*background-color: var(--accent-back-light); */cursor: pointer;}
    .result.selected{background-color: var(--accent-back-light); cursor: pointer;}
  </style>  

  <action-bar>
    <action-bar-item id="new-btn">New redirection</action-bar-item>
  </action-bar>
  
  <div id="container">

    <div id="left">
      <table id="linktab">
          <thead>
              <tr>
                <th>Id</th>
                <th>Description</th>
              </tr>
          </thead>
          <tbody id="redir" class="container">
          </tbody>
      </table>
    </div>

    <div id="right">
      <redirlink-page id="active" class="hidden"></redirlink-page>
    </div>
  </div>

  <dialog-component title="New redirect" id="new-dialog">
    <field-component label="Id / name"><input id="new-id"></input></field-component>
    <field-component label="Description"><input id="new-desc"></input></field-component>
    <field-component label="Target"><input id="new-dest"></input></field-component>
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
      this.shadowRoot.getElementById("active").setAttribute("redir", id)
      this.shadowRoot.getElementById("active").classList.remove("hidden")
    })
  }
  async refreshData(){
    let redir = this.redir = await api.get("redir")
    this.shadowRoot.getElementById("redir").innerHTML = redir.map(r => `
      <tr class="redir result" data-id="${r.id}">
        <td>${r.id}</td>
        <td>${r.description}</td>
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
        : !val.description ? "Please fill out Description"
        : !val.dest ? "Please fill out Target"
        : true,
      values: () => {return {
        id: this.shadowRoot.getElementById("new-id").value,
        description: this.shadowRoot.getElementById("new-desc").value,
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