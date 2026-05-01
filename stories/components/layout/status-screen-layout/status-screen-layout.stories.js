/**
 * Status Screen Layout Stories
 * 
 * Demonstrates:
 * - A slots-only component (no JS properties)
 * - Using the "slots" category in argTypes for documentation
 * - Injecting arbitrary HTML content into slots during render
 */

import { html } from 'lit';
import { StatusScreenLayout } from '../../../../src/components/layout/status-screen-layout/status-screen-layout.js';

if (!customElements.get('status-screen-layout')) {
  customElements.define('status-screen-layout', StatusScreenLayout);
}
export default {
  title: 'Components / Layout / Status Screen Layout',
  component: 'status-screen-layout',

  argTypes: {
    iconSlot: {
      name: 'icon',
      control: 'text',
      description: 'Slot for the top icon/illustration',
      table: { category: 'Slots' },
    },
    titleSlot: {
      name: 'title',
      control: 'text',
      description: 'Slot for the main heading text',
      table: { category: 'Slots' },
    },
    descriptionSlot: {
      name: 'description',
      control: 'text',
      description: 'Slot for the detailed message text',
      table: { category: 'Slots' },
    },
    customContentSlot: {
      name: 'custom-content',
      control: 'text',
      description: 'Optional slot for extra content (e.g., a summary card) between the description and actions',
      table: { category: 'Slots' },
    },
    actionsSlot: {
      name: 'actions',
      control: 'text',
      description: 'Slot for the buttons at the bottom',
      table: { category: 'Slots' },
    },
  },

  args: {
    iconSlot: 'ℹ️',
    titleSlot: 'Layout Title',
    descriptionSlot: 'This is the description area where the main body text goes.',
    customContentSlot: '',
    actionsSlot: '<button>Primary Action</button>',
  },

  // Since it's slots, we parse the string args into HTML using Lit's unsafeHTML or just innerHTML.
  // We'll use standard DOM manipulation for security in the render function.
  render: (args) => {
    const el = document.createElement('status-screen-layout');
    
    // Injecting slots manually
    el.innerHTML = `
      <div slot="icon" style="font-size: 2rem;">${args.iconSlot}</div>
      <span slot="title">${args.titleSlot}</span>
      <span slot="description">${args.descriptionSlot}</span>
      ${args.customContentSlot ? `<div slot="custom-content" style="padding: 16px; background: #eee; border-radius: 8px;">${args.customContentSlot}</div>` : ''}
      <div slot="actions">${args.actionsSlot}</div>
    `;
    
    return el;
  },
};

export const Default = {
  name: 'Default Layout',
  args: {
    iconSlot: '✅',
    titleSlot: 'Operation Complete',
    descriptionSlot: 'Everything has been processed successfully using the standard layout slots.',
    actionsSlot: '<lion-button>Continue</lion-button>',
  },
};

export const WithCustomContent = {
  name: 'With Custom Content',
  args: {
    iconSlot: '⚠️',
    titleSlot: 'Review Required',
    descriptionSlot: 'Please review the information below before proceeding.',
    customContentSlot: '<strong>Account:</strong> **** 1234<br><strong>Status:</strong> Pending Review',
    actionsSlot: '<lion-button>Submit</lion-button> <lion-button>Cancel</lion-button>',
  },
};
