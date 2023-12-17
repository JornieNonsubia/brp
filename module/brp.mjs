import { BRPActor } from "./actor/actor.mjs";
import { BRPItem } from "./item/item.mjs";
import { preloadHandlebarsTemplates } from "./setup/templates.mjs";
import { handlebarsHelper } from './setup/handlebar-helper.mjs';
import { BRP } from "./setup/config.mjs";
import { BRPHooks } from './hooks/index.mjs'
import { registerSettings } from './setup/register-settings.mjs'

//  Init Hook
Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.brp = {
    BRPActor,
    BRPItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.BRP = BRP;

  //Register Settings & Handlebar Helpers
  registerSettings();
  handlebarsHelper();

  // Define custom Document classes
  CONFIG.Actor.documentClass = BRPActor;
  CONFIG.Item.documentClass = BRPItem;

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});


// Ready Hook
Hooks.once("ready", async function() {
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

BRPHooks.listen()

//Add sub-titles in Config Settings for BRP- Advanced Rules
Hooks.on('renderSettingsConfig', (app, html, options) => {
  const systemTab = $(app.form).find('.tab[data-tab=system]')

  systemTab
    .find('input[name=brp\\.magic]')
    .closest('div.form-group')
    .before(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.powers') +
        '</h3>'
    )

    systemTab
    .find('input[name=brp\\.useHPL]')
    .closest('div.form-group')
    .before(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.optionalRules') +
        '</h3>'
    )

    systemTab
    .find('input[name=brp\\.hpMod]')
    .closest('div.form-group')
    .before(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.gameModifiers') +
        '</h3>'
    )

    systemTab
    .find('input[name=brp\\.background1]')
    .closest('div.form-group')
    .before(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.customise') +
        '</h3>'
    )
});

// Hotbar Macros
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.brp.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "brp.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

// Create a Macro from an Item drop.
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}