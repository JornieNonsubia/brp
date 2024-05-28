import { BRPCharDev } from "../apps/charDev.mjs"

//Add GM tools to Scene

class BRPLayer extends PlaceablesLayer {

  constructor () {
    super()
    this.objects = {}
  }

  static get layerOptions () {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: 'coc7menu',
      zIndex: 60
    })
  }

  static get documentName () {
    return 'Token'
  }

  get placeables () {
    return []
  }

}

export class BRPMenu {
  static getButtons (controls) {
    canvas.brpgmtools = new BRPLayer()
    const isGM = game.user.isGM
    controls.push({
      name: 'brpmenu',
      title: game.i18n.localize('BRP.gmTools'),
      layer: 'brpgmtools',
      icon: 'fas fa-tools',
      visible: isGM,
      tools: [
        {
          toggle: true,
          icon: 'fas fa-chevrons-up',
          name: 'development',
          active: game.settings.get('brp', 'development'),
          title: game.i18n.localize('BRP.developmentPhase'),
          onClick: async toggle => await BRPCharDev.developmentPhase(toggle)
        }
      ]
    })

  }

  static renderControls (app, html, data) {
    const isGM = game.user.isGM
    const gmMenu = html.find('.fas-fa-tools').parent()
    gmMenu.addClass('brp-menu')
  }
}