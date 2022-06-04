const { SlashCommandBuilder } = require('@discordjs/builders')
const { Permissions } = require('discord.js')

const data = new SlashCommandBuilder()
    .setName('whisper')
    .setDescription('Creates a whiper channel')
    .addUserOption(option => option
        .setName('user1')
        .setDescription('The user being whispered to')
        .setRequired(true)
    )
    .addUserOption(option => option.setName('user2').setDescription('Another user being whispered to'))
    .addUserOption(option => option.setName('user3').setDescription('Another user being whispered to'))

module.exports = {
	data: data,
	async execute(interaction) {
        const guild = interaction.guild
        if (!guild) {
            await interaction.reply('Cannot create whisper channel outside of server! Please try again in a server channel :(')
            return
        }
        const channels = await guild.channels.fetch()
        const members = [
            interaction.member,
            interaction.options.getMember('user1'),
            interaction.options.getMember('user2'),
            interaction.options.getMember('user3')
        ].filter(member => !!member)

        const whispersCategory = channels.find(channel => channel.type === 'GUILD_CATEGORY' && channel.name === 'whispers')
        if (!whispersCategory) {
            await interaction.reply('There is no category named `whispers`! Please create this category and try again :(')
            return
        }

        const channelExists = whispersCategory.children.some(({permissionOverwrites: {cache: permissions}}) => {
            for (let member of members) {
                if (!permissions.get(member.id)) {
                    return false
                }
            }
            return permissions.size === (members.length + 1)
        })

        if (channelExists) {
            await interaction.reply('There is already a whispers channel for: ' + members.map(member => member.displayName).join(', '))
            return
        }

        const permissionOverwrites = [{
            id: guild.id,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
        }]
        for (let member of members) {
            permissionOverwrites.push({
                id: member.id,
                allow: [Permissions.FLAGS.VIEW_CHANNEL],
            })
        }

        const name = members.map(member => member.displayName).join('-')

        await whispersCategory.createChannel(name, {permissionOverwrites})
        await interaction.reply('Created whisper channel :)')
        console.log('created whisper channel for: ' + members.map(member => member.displayName).join(', '))
	},
}
