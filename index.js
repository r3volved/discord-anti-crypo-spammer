const { Client, Events, GatewayIntentBits } = require('discord.js')
const { token } = require('./config.json')
if( !token?.length ) throw new Error('Please provide a token in config')

const KEYWORDS = ["i","ll","will","help","teach","enlighten","assist","earn","crypto","market"].map(w => w.toUpperCase())
const ARREST = { 
    WARN:`Chomp - No crypto spamming`,
    KICK:`Crypto scamming`, 
    BAN:{ deleteMessageSeconds: 60 * 60 * 24 * 7, reason: 'Crypto scamming' } 
}

// Create a new client instance
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] })

const reprimandAuthor = (message) => {
    //Not a member - don't let em back
    if( ARREST.BAN && !message.member ) 
        return message.guild.bans.create(message.author.id, ARREST.BAN)
            .then(() => console.info('Banned user', message.author.id, message.author.tag, message.content))
            .finally(() => message.delete())
    
    //Is a member and is bannable
    if( ARREST.BAN && message.member?.bannable )  
        return message.member.ban(ARREST.BAN)
            .then(() => console.info('Banned user', message.author.id, message.author.tag, message.content))
            .finally(() => message.delete())
    
    //Is a member and is kickable
    if( ARREST.KICK && message.member?.kickable ) 
        return message.member.kick(ARREST.KICK)
            .then(() => console.info('Kicked user', message.author.id, message.author.tag, message.content))
            .finally(() => message.delete())
    
    //Can't do shit - just issue a warning
    message.reply(ARREST.WARN)
        .then(() => console.info('Warned user', message.author.id, message.author.tag, message.content))
        .finally(() => message.delete())
}

let selfid = null
client.once(Events.ClientReady, c => {
    selfid = c.user.id
	console.log(`Ready! Logged in as ${c.user.tag} (${c.user.id})`)
	console.log(`Invite:`, `https://discord.com/api/oauth2/authorize?client_id=557575678791254017&permissions=1099511639046&scope=bot`)
    console.log(`Member of ${c.guilds.cache.size} guild(s):`)
    c.guilds.cache.forEach(guild => console.log('-', guild.id, guild.name))
    console.log(`On guard...`)
})

client.on(Events.MessageCreate, message => {
    if( message.author.id === selfid ) return //Ignore - self
    if( message.content[0].toUpperCase() !== 'I' ) return //Ignore - Doesn't start with i

    const words = message.content.split(/\s|\W/g)
    const matches = words.filter(w => KEYWORDS.includes(w.toUpperCase()))
    if( matches.length < 4 ) return //Ignore - Not enough keyword matches

    if( message.content.match(/earn\s\$\d+/i) && message.content.match(/the\scrypto/i) ) {
        //Fuck em up
        reprimandAuthor(message)
    }
})

client.login(token)
