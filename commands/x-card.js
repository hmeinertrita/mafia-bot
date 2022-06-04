const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('xcard')
    .setDescription('Sends an X card in a channel')
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('The channel to send the X card to')
        .setRequired(true)
    )

module.exports = {
	data: data,
	async execute(interaction) {
        const channel = interaction.options.getChannel('channel')
        if (channel.type === 'GUILD_TEXT') {
            const xCardEmbed = new MessageEmbed()
                .setTitle('**X Card**')
                .setDescription('Someone raised the X card! Please stop and fade to black.')
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/5/5f/Red_X.png')
                .setColor('RED')
            await channel.send({embeds: [xCardEmbed]})
            const followUpRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('notifyNiz')
					.setLabel('Notify Niz')
					.setStyle('DANGER'),
                new MessageButton()
					.setCustomId('noNotify')
					.setLabel('Do Not Notify')
					.setStyle('SECONDARY'),
			);


            await interaction.reply({ content: 'Anonymously sent X card to `#' + channel.name + '`', ephemeral: true })
            console.log('x card sent in #' + channel.name)
            if (interaction.client.niz) {
                await interaction.followUp({ content: 'Do you want to notify Niz that you were the one who raised the X card?', components: [followUpRow], ephemeral: true })
            }
        }
        else {
            await interaction.reply({ content: '`#' + channel.name + '` is not a text channel!', ephemeral: true })
        }
	},
}
