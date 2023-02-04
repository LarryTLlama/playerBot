const { Events, InteractionType } = require('discord.js');


module.exports = {
    name: Events.InteractionCreate,
    description: "Emitted when the client becomes ready to start working.",
    once: false,
    async execute(client, interaction) {
        console.log("Interaction recieved: ", interaction.commandName)
        const command = client.commands.get(interaction.commandName);
            
        if (!command) return interaction.reply('This command does not exist.');
        if(interaction.isChatInputCommand()) {
            try {
                command.execute(client, interaction);
            } catch (error) {
                console.error(error)
            }
        } else if (interaction.isAutocomplete()) {
            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error)
            }
        }
    },
};
