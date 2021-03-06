/**
 * @license
 * Copyright (C) 2015 Vaadin Ltd.
 * This program is available under Commercial Vaadin Add-On License 3.0 (CVALv3).
 * See the file LICENSE.md distributed with this software for more information about licensing.
 * See [the website]{@link https://vaadin.com/license/cval-3} for the complete license.
 */

import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin';
import { colorVars } from '../utils/vcf-network-shared';

/**
 * Dialog for selecting export options.
 * Current selection may be exported as a network or component template.
 */
class VcfNetworkExportDialog extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="lumo-typography">
        :host {
          display: none;
        }
      </style>
      <vaadin-confirm-dialog id="dialog" header="Export Selection As" cancel confirm-text="Export">
        <div id="content">
          <vaadin-radio-group id="export-type" name="radio-group" value="{{exportType}}">
            <vaadin-radio-button value="network">Network</vaadin-radio-button>
            <vaadin-radio-button value="template">Template Component</vaadin-radio-button>
          </vaadin-radio-group>
          <vaadin-text-field id="name" label="Name" required disabled="[[_isNetworkExport(exportType)]]">
            [[label]]
          </vaadin-text-field>
          <vaadin-select id="color" label="Color" required disabled="[[_isNetworkExport(exportType)]]">
            <template>
              <vaadin-list-box>
                <template is="dom-repeat" items="[[_colors]]">
                  <vaadin-item>
                    <vcf-network-color-option
                      color="[[index]]"
                      selected="{{index === color}}"
                      disabled="[[_isNetworkExport(exportType)]]"
                    >
                      [[index]]
                    </vcf-network-color-option>
                  </vaadin-item>
                </template>
              </vaadin-list-box>
            </template>
          </vaadin-select>
        </div>
        <vaadin-button id="export" slot="confirm-button" theme="primary">
          Export
        </vaadin-button>
        <vaadin-button id="cancel" slot="cancel-button" theme="tertiary">
          Cancel
        </vaadin-button>
      </vaadin-confirm-dialog>
    `;
  }

  static get is() {
    return 'vcf-network-export-dialog';
  }

  static get properties() {
    return {
      component: Object,
      network: Object,
      autoExport: {
        type: Boolean,
        value: false
      },
      exportType: {
        type: String,
        value: 'network'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._colors = colorVars;
    this.$.cancel.addEventListener('click', () => this.close());
    this.$.export.addEventListener('click', () => {
      if (this.isValid) {
        const filename = `${this.exportType}.json`;
        const obj = this.exportType === 'network' ? this.network : this.component;
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj));
        const download = document.createElement('a');
        download.setAttribute('href', dataStr);
        download.setAttribute('download', filename);
        download.click();
        this.close();
      }
    });
    this.$.name.addEventListener('change', e => (this.component.label = e.target.value));
    this.$.color.addEventListener('change', e => (this.component.componentColor = Number(e.target.value)));
  }

  get isValid() {
    let nameValid = true;
    let colorValid = true;
    nameValid = this.$.name.validate();
    colorValid = this.$.color.validate();
    return this._isNetworkExport() || (nameValid && colorValid);
  }

  open() {
    this.$.name.value = this.component.label;
    this.$.color.value = String(this.component.componentColor);
    if (this.autoExport) {
      this.$.export.click();
    } else {
      this.$.dialog.opened = true;
      const overlay = document.querySelector('vaadin-dialog-overlay');
      const overlayPart = overlay.shadowRoot.querySelector('[part="overlay"]');
      const content = overlay.$.content.querySelector('#content');
      content.style.width = '200px';
      overlayPart.style.width = 'calc(200px + 2 * var(--lumo-space-l))';
    }
  }

  close() {
    this.$.dialog.opened = false;
    this.autoExport = false;
    this.exportType = 'network';
  }

  _isNetworkExport(exportType = this.exportType) {
    return exportType === 'network';
  }
}

customElements.define(VcfNetworkExportDialog.is, VcfNetworkExportDialog);
