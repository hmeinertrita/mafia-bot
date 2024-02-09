const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
require('dotenv').config()

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

const echoRegex = /^\{\{.+\}\}$/
client.jails = {}
client.setJailer = (guildId, channel) => {
    if (channel.guild.id !== guildId) { throw "Channel is not in this server!" }
    if (!client.jails[guildId]) { client.jails[guildId] = {} }
    if (client.jails[guildId].jailerCollector) { client.jails[guildId].jailerCollector.stop() }
    client.jails[guildId].jailerCollector = channel.createMessageCollector({filter: ( m => echoRegex.test(m.content))})
    client.jails[guildId].jailerChannel = channel
    console.log('jailer channel set to #' + channel.name)

    client.jails[guildId].jailerCollector.on('collect', async m => {
        const content = m.content.replace(/^\{\{/, '').replace(/\}\}$/, '')
        if (client.jails[guildId].jaileeChannel) {
            const embed = new MessageEmbed()
                .setTitle('_The Jailer says:_ ')
                .setDescription(content)
            await client.jails[guildId].jaileeChannel.send({ embeds: [embed] })
            console.log('jailer ' + m.member.displayName + ' says: ' + content)
        }
        else {
            await m.reply('Jailee channel is not set! Please use `/jailee` and try again.')
        }
    })
}

client.setJailee = (guildId, channel) => {
    if (channel.guild.id !== guildId) { throw "Channel is not in this server!" }
    if (!client.jails[guildId]) { client.jails[guildId] = {} }
    if (client.jails[guildId].jaileeCollector) { client.jails[guildId].jaileeCollector.stop() }
    client.jails[guildId].jaileeCollector = channel.createMessageCollector({filter: ( m => echoRegex.test(m.content))})
    client.jails[guildId].jaileeChannel = channel
    console.log('jailee channel set to #' + channel.name)

    client.jails[guildId].jaileeCollector.on('collect', async m => {
        const content = m.content.replace(/^\{\{/, '').replace(/\}\}$/, '')
        if (client.jails[guildId].jailerChannel) {
            const embed = new MessageEmbed()
                .setTitle('_' + (m.member.nickname || m.member.displayName) + ' says:_')
                .setDescription(content)
            await client.jails[guildId].jailerChannel.send({ embeds: [embed] })
            console.log('jailee ' + m.member.displayName + ' says: ' + content)
        }
        else {
            await m.reply('Jailer channel is not set! Please use `/jailer` and try again.')
        }
    })
}

//Commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return
    
	const command = client.commands.get(interaction.commandName);
	if (!command) return

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
	}
});

//Buttons
client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return
    
	if (interaction.customId === 'notifyNiz') {
        await client.niz.send(interaction.user.username + ' just raised the X card!')
		await interaction.update({ content: 'Niz was notified!', components: [] });
        console.log('niz notified of x card!')
	}
    else if (interaction.customId === 'noNotify') {
		await interaction.update({ content: 'Thank you! Your X card will remain anonymous.', components: [] });
	}
});

client.once('ready', async () => {
    if (process.env.NIZ_ID) {
        client.niz = await client.users.fetch(process.env.NIZ_ID)
        console.log('fetched niz user')
    }
    console.log('bot is ready!')
})

// Login to Discord with your client's token
client.login(process.env.TOKEN)