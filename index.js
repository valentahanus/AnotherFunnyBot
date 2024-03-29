const { token } = require('./config.json');
const { Client, IntentsBitField, ActivityType, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

let status = [
  {
    name: 'Valorant',
    type: ActivityType.Streaming,
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    name: 'your every move',
    type: ActivityType.Watching,
  },
  {
    name: 'silly_gander',
    type: ActivityType.Listening,
  },
];

client.on('ready', (c) => {
  console.log(`${c.user.tag} is online.`);

  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 10000);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'hi') {
    return interaction.reply('Hello there.');
  }

  if (interaction.commandName === 'ping') {
    return interaction.reply('pong');
  }

  if (interaction.commandName === 'pong') {
    return interaction.reply('ping');
  }

  if (interaction.commandName === 'selfie') {
    const fs = require('fs');
    const path = require('path');

    const selfieDir = path.join(__dirname, 'Selfies');
    const selfieFiles = fs.readdirSync(selfieDir);
    const selfieIndex = Math.floor(Math.random() * selfieFiles.length);
    const selfieFile = path.join(selfieDir, selfieFiles[selfieIndex]);

    const embed = new EmbedBuilder()
      .setTitle('Enjoy your selfie')
      .setDescription(`Done by ${client.user.tag}. Spreading is punishable...`)
      .setColor('ffffff')
      .setImage(`attachment://${selfieFiles[selfieIndex]}`)
      ;

    interaction.reply({ embeds: [embed], files: [selfieFile] });
  }

  if (interaction.commandName === 'status') {
    const ping = Math.round(interaction.client.ws.ping);

    return interaction.reply(`I'm ${client.user.tag} and my ping is ${ping}ms.`);
  }

  if (interaction.commandName === 'repeat') {
    const message = interaction.options.getString('message');
    await interaction.reply(message);
  }

  if (interaction.commandName === 'reference') {
    const fs = require('fs');
    const path = require('path');
    const { options } = interaction;
    const option = options.getString('category');
  
    if (!option) {
      return interaction.reply('Please provide a category for the reference!');
    }
  
    const categoryDir = path.join(__dirname, 'Reference', option.toLowerCase());
    const categoryFiles = fs.readdirSync(categoryDir).filter(file => /\.(jpe?g|png|gif)$/i.test(file));
    const categoryIndex = Math.floor(Math.random() * categoryFiles.length);
    const categoryFile = path.join(categoryDir, categoryFiles[categoryIndex]);
  
    const embed = new EmbedBuilder()
      .setTitle(`Enjoy your ${option.toLowerCase()} reference`)
      .setDescription(`Done by ${client.user.tag}. Spreading is punishable...`)
      .setColor('ffffff')
      .setImage(`attachment://${categoryFiles[categoryIndex]}`);
  
    interaction.reply({ embeds: [embed], files: [categoryFile] });
  }

  if (interaction.commandName === 'roll') {
    const min = interaction.options.getString('minimum');
    const max = interaction.options.getString('maximum');

    if (isNaN(min) || isNaN(max)) {
      return interaction.reply({ content: 'Please provide valid numbers.', ephemeral: true });
    }

    const randomNumber = Math.floor(Math.random() * (max - min + 1));
    interaction.reply(`You've rolled ${randomNumber} between ${min}/${max}`);
  }

  const { exec } = require('child_process');
  
  function splitMessage(str) {
    const MAX_LENGTH = 2000;
    const messages = [];
  
    while (str.length > 0) {
      if (str.length <= MAX_LENGTH) {
        messages.push(str);
        break;
      }
  
      let sliceIndex = str.lastIndexOf('\n', MAX_LENGTH);
      if (sliceIndex === -1) sliceIndex = MAX_LENGTH;
  
      messages.push(str.slice(0, sliceIndex));
      str = str.slice(sliceIndex + 1);
    }
  
    return messages;
  }
  
  if (interaction.commandName === 'clirun') {
    const command = interaction.options.getString('command');
    const password = interaction.options.getString('password');
    const ThePassword = 'AnotherFunnyBot';

    if (password !== ThePassword) {
        return interaction.reply('Incorrect password provided.');
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return interaction.reply(`An error occurred while running the command: ${error.message}`);
        }
    
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    
        const messages = splitMessage(stdout);
        messages.forEach(message => interaction.reply(`\`\`\`${message}\`\`\``));
    });
  }

  const fs = require('fs');

  if (interaction.commandName === 'fetch') {
    const fileName = interaction.options.getString('filename');
    try {
      const file = await fetchFile(fileName);
      await interaction.reply({ files: [file] });
    } catch (error) {
      await interaction.reply(`Error: ${error.message}`);
    }
  }

  async function fetchFile(fileName) {
    return new Promise((resolve, reject) => {
      fs.access(fileName, fs.constants.F_OK, (err) => {
        if (err) {
          reject(new Error(`File ${fileName} not found`));
        } else {
          const fileStream = fs.createReadStream(fileName);
          fileStream.on('error', (error) => {
            reject(error);
          });
          fileStream.on('open', () => {
            resolve(fileStream);
          });
        }
      });
    });
  }

  if (interaction.commandName === 'createtxt') {
    const fileName = interaction.options.getString('filename');
    const text = interaction.options.getString('text');
    try {
      fs.writeFileSync(`${fileName}.txt`, text);
      await interaction.reply(`The file ${fileName}.txt was successfully saved!`);
    } catch (error) {
      await interaction.reply(`Error: ${error.message}`);
    }
  }
});

client.login(token);