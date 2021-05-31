module.exports = {
    bot: {
        token: "",
        prefix: "-",
        owners: [""],
        mongourl: "MONGODB URL"
    },

    website: {
        callback: "https://your-domain.com/callback",
        secret: "CLIENT SECRET",
        clientID: "CLIENT ID",
        tags: [ "Moderation", "Fun", "Minecraft","Economy","Guard","NSFW","Anime","Invite","Music","Logging", "Web Dashboard", "Reddit", "Youtube", "Twitch", "Crypto", "Leveling", "Game", "Roleplay", "Utility", "Turkish" ]    
    },

    server: {
        id: "SERVER ID",
        roles: {
            yonetici: "ADMINISTRATOR ROLE ID",
            moderator: "MODERATOR ROLE ID",
            profile: {
                booster: "",
                sponsor: "",
                supporter: "",
                partnerRole: ""
            },
            codeshare: {
                javascript: "JS",
                html: "HTML",
                altyapilar: "substructure",
                bdfd: "BDFD",
                besdavet: "5 INVITES",
                ondavet: "10 INVITES",
                onbesdavet: "15 INVITES",
                yirmidavet: "20 INVITES"
            },
            botlist: {
                developer: "",
                certified_developer: "",
                bot: "",
                certified_bot: ""
            }
        },
        channels: {
            codelog: "CODE-LOG",
            login: "LOGIN-LOG",
            webstatus: "WEBSITE-STATUS",
            uptimelog: "UPTIME-LOG",
            botlog: "BOT-LOG",
            votes: "VOTE-LOG"
        }
    }


}