/**
DO NOT DELETE THIS!!
TeGriAi Testing, Ticker, Bots, 9/24/2023
*/

// Import the required classes/functions
const { Client, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require("discord.js");
const { parse: parseHtml } = require("node-html-parser")

const client = new Client({ intents: [] });

const TOKEN = "bot token goes here";

const rest = new REST({ version: '10' }).setToken(TOKEN);

const geniusApiAccessToken = "access token goes here";

// Build the "lyrics" command using a slash command builder
const commands = [
    new SlashCommandBuilder()
        .setName("lyrics")
        .setDescription("מציאת מילים")
        .addStringOption(opt => opt
            .setName("song")
            .setDescription("מהו השיר?")
            .setRequired(true))
        .addStringOption(opt => opt
            .setName("artist")
            .setDescription("מיהו הזמר?")
            .setRequired(true))
];

// Listen for when the bot is online
client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        console.log('Started refreshing application (/) commands.');

        // Register the slash commands (only "lyrics" in our case) on discord's API
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

// Listen for new interactions
client.on("interactionCreate", async interaction => {
    if (interaction.isChatInputCommand()) // Used generally for auto-completion (IntelliSense)
    {
        // Check if our "lyrics" command has been executed
        if (interaction.commandName == "lyrics") {
            const songName = interaction.options.getString("song");
            const artistName = interaction.options.getString("artist");

            // pre-build the lyrics embed
            const lyricsEmbed = new EmbedBuilder();

            try {
                // Show the "thinking..." state to give the bot some time (up to 15 minutes) to fetch the song
                // without this, the bot will be limited to 3 seconds,
                // and there are some songs that will take more than 3 seconds to be fetched
                await interaction.deferReply();

                const song = await getSong(songName, artistName);

                lyricsEmbed
                    .setTitle(`מילים לשיר: ${song.title} על ידי ${song.artist_names}`)
                    .setColor("Green")
                    .setDescription(song.lyrics);
            } catch (errorMessage) {
                // Forcing errorMessage to be a string (incase of an unexpected error object)
                lyricsEmbed
                    .setTitle("שגיאה במציאת המילים.")
                    .setDescription(`${errorMessage}`);
            }

            // Update the user with the result
            interaction.editReply({ embeds: [lyricsEmbed] });
        }
    }
});

// Get the song object of a song using Genius API (+ "lyrics" property)
async function getSong(songName, artistName) {
    const url = `https://api.genius.com/search?q=${encodeURIComponent(`${songName} ${artistName}`)}`;
    const { response, meta } = await fetch(url, {
        headers: {
            Authorization: `Bearer ${geniusApiAccessToken} `
        }
    }).then(res => res.json());

    // Handle the response
    if (meta.status != 200) {
        throw Error("An error occured while fetching a song from Genius API: " + response.meta.message);
    }

    if (response.hits.length === 0) {
        throw Error("The specified song couldnt be found in Genius API.");
    }

    // Get the first song appearing in the search results
    const song = response.hits[0].result;
    const lyricsUrl = song.url;

    // fetch the lyrics page
    const lyricsHtmlPage = await fetch(lyricsUrl).then(res => res.text());

    // manipulate the html to extract the lyrics
    const document = parseHtml(lyricsHtmlPage);
    const lyricsRoot = document.getElementById("lyrics-root");
    const lyricsContainer = lyricsRoot.querySelectorAll("[data-lyrics-container=true]")[0];

    // textContent will ignore all html tags and give us the clean text of the lyrics.
    song.lyrics = lyricsContainer.textContent;

    return song;
}


// Connect our bot to discord
client.login(TOKEN);