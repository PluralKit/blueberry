export default {
    guild_id: "466707357099884544",
    chat_role_id: "823595534567866428",
    restrict_role_id: "895972446992228382",
    admin_role_id: "686489711719612502",
    staff_role_id: "913986523500777482",
    infra_role_id: "1291763746657669211",
    update_requests_channel: "1310730413211254905",
    staff_channel: "1211833185520844813",

    lockdownChannels: [
      "471385416595931176",  // #command-spam
      "468104786235883530",  // #tupperbox-import

      "1319461648251097288", // #bot-support
      "1310730413211254905", // #update-requests
      "961622977458360373",  // #website
      "468821582794588160",  // #suggestions-feedback

      "912804952953479171",  // #third-party-discussion

      "710861135842115931",  // #internal-stuffs
      "1330225538513768552", // #infrastructure
      "635146116144431149",  // #bug-reports-and-errors
      "557321432342855691",  // #api-support
      "598555595808702473",  // #beta-testing
    ],

    allowedInvites: [
      "PczBt78", // pluralkit
      "2tFRMBw", // plural hub
      "k5Psmjv7hy", // simply plural
    ],

    // 2 weeks
    newAccountDuration:
          60 // seconds
        * 60 // minutes
        * 24 // hours
        * 7  // days
        * 2  // weeks
}
