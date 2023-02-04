const { Events } = require('discord.js');
const axios = require('axios')
 // Begin database stuff
 const { Sequelize, Model, DataTypes } = require('sequelize');
 const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});
 const User = sequelize.define('Users', {
     username: DataTypes.STRING,
     uuid: DataTypes.STRING,
     lastjoin: DataTypes.DATE,
 });
 User.sync()
module.exports = {
    name: Events.ClientReady,
    description: "Emitted when the client becomes ready to start working.",
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        await client.guilds.cache.get(process.env.GUILD_ID).commands.set(client.commands.map(command => command.data));

        //The smallest coordinates
        let firstSet = [5505, -1801]

        //The largest coordinates
        let secondSet = [5722, -2001]

        //Lets log those coords
        console.log(`Beginning alarm system. Checking for coordinates between (${firstSet.toString()}) and (${secondSet.toString()})`)

        //Make requests every minute when someone enters the area

        //Keep check of who was inside last time, so it doesn't spam ping me
        let wasInside = []

        //Here's where we tell it "do that every minute"
        setInterval(async () => {
            //Keep track of who is inside now, to switch to the wasInside list 
            //IMPORTANT: Add usernames who you want to ignore in the below array :p
            let nowInside = [];

            //Get the data from the map
            let json = await axios.get("http://web.peacefulvanilla.club/maps/tiles/players.json");

            //For each player from this data sheet
            json.data.players.forEach(async (item) => {
                //Check if they satisfy the coordinates
                if((item.x > firstSet[0]) && (item.x < secondSet[0]) && (item.z < firstSet[1]) && (item.z > secondSet[1])) {

                    //Check if they aren't already in the area
                    if(wasInside.indexOf(item.name) == -1) {
                        //If not in the "Already there" list:
                        //We'll send a DM to Larry!

                        //Fetch my DMs
                        const user = await client.users.fetch("658626800049717259")

                        //And send!
                        user.send(item.name + " just entered your base! ")


                        //Log this to console too, just in case
                        console.log(item.name + " just enetered your base!")

                        //Add the player name to the nowInside list
                        nowInside.push(item.name)
                    } else {
                        //If they haven't just come into the base

                        //Add them back in
                        nowInside.push(item.name)
                    }
                }
                // Change everyone without a last name to "Doe"
                async function search() {
                    return await User.findOne({
                        where: {
                            username: item.name
                        }
                       })
                }
                if(await search(item.name) == null) {
                    return await User.create({ username: item.name, lastjoin: new Date(), uuid: item.uuid });
                }
                return await User.update(
                    { lastjoin: new Date() }, 
                    { where: { username: item.name } }
                );
            })
            wasInside = nowInside;
        }, 15000)
    },
    database: {
        async query(name) {
           return await User.findOne({
            where: {
                username: name
            }
           })
        },
        async add(name, uuid) {
            return await User.create({ username: name, lastjoin: new Date(), uuid: uuid });
        }, 
        async update(name) {
            // Change everyone without a last name to "Doe"
            return await User.update({ lastjoin: new Date() }, {
                where: {
                    username: name
                }
            });
        }
    }
};
