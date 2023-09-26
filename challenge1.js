/**
DO NOT DELETE THIS!!
TeGriAi Testing, Ticker, Bots, 9/24/2023
*/

const { ButtonBuilder, Client, ButtonStyle, ActionRowBuilder } = require("discord.js");
// A "Guilds" intent is required in order to perform guild-related operations
const client = new Client({ intents: ["Guilds"] });

// Define the set of jokes.
// Relies on a specific format: {joke}\n{punchLine} and 2 "new lines - \n" between jokes
const JOKES = `מה עושה קרש בבית ספר?
כותב תזוזות!

איזה עץ תמצא בכל בית?
קרש!

איך קרש נוגעת לעניין?
היא יושבת בבר, מחכה להתנהג במגונן.

למה קרש עצובה?
היא רוצה להתקשר לאמא שלה, אבל נתקעה תחת המיטה!

מה עושה קרש בסוף שבוע?
נופשת על החוף ומתקשרת עם סירת גלישה!`.split("\n\n");

// The "custom id" of the "jokes" button.
const JOKES_BUTTON_ID = "jokes";

// Please configure the channel id of the specific channel you wish
// the "jokes" button to be sent in
const CHANNEL_ID = "channel id goes here";

// Listen for when the bot is online
client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        // Get the channel in which the "jokes" button will be sent in
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (!channel) throw Error("The provided channel id is unknown.");

        if (!channel.isTextBased()) throw Error("The provided channel is not a text-based channel.");

        const jokesButton = new ButtonBuilder()
            .setCustomId(JOKES_BUTTON_ID)
            .setLabel("בדח אותי")
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .setComponents(jokesButton);

        // Send the "jokes" button in the specified channel.
        const msg = await channel.send({ content: "בדיחות :wood:", components: [row] });
        
        console.log(`Successfully sent the "jokes" button.\nMessage URL: ${msg.url}`);
    } catch (error) {
        console.error(error);
    }
});

// Listen for new interactions
client.on("interactionCreate", interaction => {
    if (interaction.isButton()) // Used generally for auto-completion (IntelliSense)
    {
        // Check if our "jokes" button has been pressed
        if (interaction.customId == JOKES_BUTTON_ID) {
            // Generate a random joke out of our pre-defined set of jokes
            const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
            const [joke, punchLine] = randomJoke.split("\n");

            // Finally, send the generated random joke
            interaction.reply(`${joke}\n||${punchLine}||`);
        }
    }
});

// Connect our bot to discord
client.login("bot token goes here");