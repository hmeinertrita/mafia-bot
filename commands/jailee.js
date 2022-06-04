const { SlashCommandBuilder } = require('@discordjs/builders')

const data = new SlashCommandBuilder()
    .setName('jailee')
    .setDescription('Sets the current jailee channel')
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('The new jailee channel')
        .setRequired(true)
    )

module.exports = {
	data: data,
	async execute(interaction) {
        const channel = interaction.options.getChannel('channel')
        if (channel.type === 'GUILD_TEXT') {
            interaction.client.setJailee(interaction.guild.id, channel)
            await interaction.reply({ content: 'Set jailee channel to `#' + channel.name + '`', ephemeral: true })
        }
        else {
            await interaction.reply({ content: '`#' + channel.name + '` is not a text channel!', ephemeral: true })
        }
	},
}
