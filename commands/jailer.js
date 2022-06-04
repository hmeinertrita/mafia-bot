const { SlashCommandBuilder } = require('@discordjs/builders')

const data = new SlashCommandBuilder()
    .setName('jailer')
    .setDescription('Sets the current jailer channel')
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('The new jailer channel')
        .setRequired(true)
    )

module.exports = {
	data: data,
	async execute(interaction) {
        const channel = interaction.options.getChannel('channel')
        if (channel.type === 'GUILD_TEXT') {
            interaction.client.setJailer(interaction.guild.id, channel)
            await interaction.reply({ content: 'Set jailer channel to `#' + channel.name + '`', ephemeral: true })
        }
        else {
            await interaction.reply({ content: '`#' + channel.name + '` is not a text channel!', ephemeral: true })
        }
	},
}
