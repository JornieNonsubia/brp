import { BRPCheck} from "../apps/check.mjs"

export class OPCard {

 
  //Resolve a combined card - roll dice, update and close
  static async OPResolve (config) {
    let targetMsg = await game.messages.get(config.targetChatId)
    let chatCards =targetMsg.flags.brp.chatCard
    if (chatCards.length <2) {
      ui.notifications.warn(game.i18n.localize('BRP.resolveMore'))
      return}

    //Sort chatCards by result level, by roll and then by rawValue
    chatCards.sort(function(a, b){
      let x = a.rawScore;
      let y = b.rawScore;
      let r = a.rollVal;
      let s = b.rollVal;
      let p = a.resultLevel;
      let q = b.resultLevel;
      if (p > q) {return -1};
      if (p < q) {return 1};
      if (r > s) {return -1};
      if (r < s) {return 1};
      if (x > y) {return -1};
      if (x < y) {return 1};
      return 0;
    });

    let newchatCards = []
    //Get the success level of the second placed person
    let adjLevel = chatCards[1].resultLevel
    adjLevel = Math.max(adjLevel -1,0)
    for (let i of chatCards) {
      i.origResLevel = i.resultLevel
      if (i.origResLevel >1) {
        i.resultLevel = Math.max(i.resultLevel - adjLevel,2)
      }
      i.resultLabel = game.i18n.localize('BRP.resultLevel.'+i.resultLevel)  
      i.origResLabel = game.i18n.localize('BRP.resultLevel.'+i.origResLevel)
      newchatCards.push(i)
    }  

    AudioHelper.play({ src: CONFIG.sounds.dice }, true)
    await targetMsg.update({'flags.brp.chatCard' :newchatCards,
                            'flags.brp.state': 'closed',
                          })
    const pushhtml = await BRPCheck.startChat(targetMsg.flags.brp)
    await targetMsg.update({content: pushhtml})    
    await BRPCheck.tickXP (targetMsg.flags.brp)
    return
  }  
}