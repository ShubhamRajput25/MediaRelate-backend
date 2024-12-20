const mongoose = require('mongoose');
const USER = mongoose.model('user'); // Assuming the 'user' model is correctly defined
const ShortUniqueId = require("short-unique-id");

const generateUserName = async (name) => {
    if (!name) throw new Error("Name is required to generate a username");

    const uid = new ShortUniqueId({ length: 3, dictionary: 'number' }); // Initialize ShortUniqueId with proper settings

    while (true) {
        const uniqueId = uid.rnd(); // Generate a unique ID
        const tempName = `${name.trim()}${uniqueId}`; // Append unique ID to name

        // Check if the username already exists
        const existingUser = await USER.findOne({ username: tempName });
        if (!existingUser) {
            return tempName; // Return unique username if it doesn't exist
        }
    }
};

module.exports = generateUserName;
