/**
DO NOT DELETE THIS!!
TeGriAi Testing, Ticker, Bots, 9/24/2023
*/

// Import the required classes/functions
const { Client, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require("discord.js");
const { evaluate } = require("mathjs");

const client = new Client({ intents: [] });

const TOKEN = "bot token goes here";

const rest = new REST({ version: '10' }).setToken(TOKEN);

// Define our calc constants
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const operationsChoices = ['+', '-', '*', '/'].map(operation => ({ name: operation, value: operation }));
const digitsChoices = digits.map(digit => ({ name: digit.toString(), value: digit }));

// Build the "calc" command using a slash command builder
const commands = [
    new SlashCommandBuilder()
        .setName("calc")
        .setDescription("בצע פעולה מתמטית בין 2 ספרות.")
        .addIntegerOption(opt => opt
            .setName("first_digit")
            .setDescription("מהו המספר הראשון?")
            .setChoices(...digitsChoices))
        .addStringOption(opt => opt
            .setName("operation")
            .setDescription("מה הפעולה שאתה רוצה להשתמש בה?")
            .setChoices(...operationsChoices))
        .addIntegerOption(opt => opt
            .setName("second_digit")
            .setDescription("מהו המספר השני?")
            .setChoices(...digitsChoices))
];

// Listen for when the bot is online
client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        console.log('Started refreshing application (/) commands.');

        // Register the slash commands (only "calc" in our case) on discord's API
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

// Listen for new interactions
client.on("interactionCreate", interaction => {
    if (interaction.isChatInputCommand()) // Used generally for auto-completion (IntelliSense)
    {
        // Check if our "calc" command has been executed
        if (interaction.commandName == "calc") {
            const firstDigit = interaction.options.getInteger("first_digit");
            const operation = interaction.options.getString("operation");
            const secondDigit = interaction.options.getInteger("second_digit");
            const expression = `${firstDigit} ${operation} ${secondDigit}`;

            // pre-build the result embed
            const resultEmbed = new EmbedBuilder()
                .setTitle("מחשבון")
                .setColor("Green");

            // Prevent division by 0
            if (operation == '/' && secondDigit == 0) {
                resultEmbed
                    .setColor("Red")
                    .setDescription("אסור לחלק מספר באפס.");
            }
            else {
                // There are two ways to achieve such a simple calculation:
                // the efficient way using a switch-case and a more clean way using mathjs library
                // for the sake of this exercise we will choose the cleaner way
                resultEmbed.setDescription(`התוצאה לחישוב \`${expression}\` היא \`${evaluate(expression)}\``)
            }

            // Update the user with the result
            interaction.reply({ embeds: [resultEmbed] });
        }
    }
});

// Connect our bot to discord
client.login(TOKEN);