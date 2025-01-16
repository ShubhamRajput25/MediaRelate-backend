const express = require('express')
const mongoose = require('mongoose')
const requireLogin = require('../middlewares/requireLogin')
const router = express.Router()
const contact = require('../models/contact')
const message = require('../models/message')


router.get('/fetch-all-contact',requireLogin, async function (req, res) {
    try{
        const userId = req.user._id

        let contactList = await contact.find({
            $or:[
                {"users.0":userId}, {"users.1":userId}
            ]
        }).populate("users") 
        .populate("lastMessage"); 
        
        if(contactList) {
            res.status(200).json({status:true, message:'contact fetched successful', data:contactList})
        }else {
            res.status(100).json({status:false, message:'failed to fetch conatcts', data:[]})
        }
    }catch(e){
        console.log("error", e)
        res.status(400).json({status:false, message:'server error', data:[]})
    }
})

router.post('/send-message', requireLogin, async function (req, res) {
    try {
        const { userId, friendId, userMessage } = req.body;

        if (!userId || !friendId || !userMessage) {
            return res.status(300).json({ status: false, message: 'Please provide required data', data: [] });
        }

        // Check if contact already exists between user and friend
        let isContactBuild = await contact.find({
            users: { $all: [userId, friendId] }  // Use $all to ensure both userId and friendId are in the users array
        }).populate("users")
          .populate("lastMessage");

        if (isContactBuild.length > 0) {
            // Send message if contact exists
            let sendMessage = await message.create({
                senderId: userId,
                receiverId: friendId,
                message: userMessage
            });

            if (sendMessage) {
                let updateLastMessage = await contact.updateOne(
                    { users: { $all: [userId, friendId] } },
                    { $set: { lastMessage: sendMessage._id } }
                );

                if (updateLastMessage.modifiedCount > 0) {
                    return res.status(200).json({ status: true, message: "Message sent and last message updated successfully", data: [] });
                } else {
                    return res.status(300).json({ status: false, message: "Failed to update last message", data: [] });
                }
            } else {
                return res.status(300).json({ status: false, message: 'Failed to send message', data: [] });
            }
        } else {
            // Create new contact if none exists
            let createContact = await contact.create({
                users: [userId, friendId],
            });

            if (createContact) {
                // Create message after creating contact
                let createMessage = await message.create({
                    senderId: userId,
                    receiverId: friendId,
                    message: userMessage
                });

                if (createMessage) {
                    let updateLastMessage = await contact.updateOne(
                        { users: { $all: [userId, friendId] } },
                        { $set: { lastMessage: createMessage._id } }
                    );

                    if (updateLastMessage.modifiedCount > 0) {
                        return res.status(200).json({ status: true, message: "Contact created, message sent, and last message updated", data: [] });
                    } else {
                        return res.status(300).json({ status: false, message: "Failed to update last message", data: [] });
                    }
                } else {
                    return res.status(300).json({ status: false, message: "Failed to send message after creating contact", data: [] });
                }
            } else {
                return res.status(300).json({ status: false, message: "Failed to create contact", data: [] });
            }
        }

    } catch (e) {
        console.log("Error:", e);
        res.status(400).json({ status: false, message: 'Server error', data: [] });
    }
});

router.post('/fetch-all-contact-messages',requireLogin, async (req, res) => {
    try {
        const {userId, friendId} = req.body

        let messages = await message.find({
            $or:[
                {$and:[
                    {senderId:userId} ,{receiverId:friendId}
                ]},
                {$and:[
                    {senderId:friendId}, {receiverId:userId}
                ]}
            ]
        })

        if(messages?.length > 0) {
            return res.status(200).json({status:true, message:"contact messages fetch successfully!", data:messages})
        } else {
            return res.status(300).json({status:false, message:"failed to fetch contact messages", data:[]})
        }
    } catch (e) {
        console.log("error", e)
        res.status(400).json({status:false, message:'server error', data:[]})
    }
})

router.post('/unsend-message/:messageId',requireLogin, async (req, res) => {
    try {
        const {messageId} = req.params

        if(!messageId) {
            return res.status(400).json({status:false, message:'please send message id'})
        }

        let findMessage = await message.findOne({_id:messageId})

        if(!findMessage) {
            return res.status(404).json({status:false, message:'cant not find message in the database'})
        }

        let deleteMessage = await message.deleteOne({_id:messageId})

        if(deleteMessage?.deletedCount > 0) {
            return res.status(200).json({status:true, message:'message delete successfully!'})
        }else{
            return res.status(404).json({status:false, message:'failed to delete message'})
        }

    } catch (e) {
        console.log("error", e)
        res.status(400).json({status:false, message:'server error', data:[]})
    }
})

router.post('/delete-contact/:contactId', requireLogin, async (req, res) => {
    try {
        const { contactId } = req.params;

        // Check if `contactId` is provided
        if (!contactId) {
            return res.status(400).json({ status: false, message: 'Please provide a contact ID' });
        }

        // Find the contact by ID
        let findContact = await contact.findOne({ _id: contactId });

        if (!findContact) {
            return res.status(404).json({ status: false, message: 'Contact not found in the database' });
        }

        // Delete the contact
        let deleteContact = await contact.deleteOne({ _id: contactId });

        if (deleteContact?.deletedCount > 0) {
            return res.status(200).json({ status: true, message: 'Contact deleted successfully!' });
        } else {
            return res.status(500).json({ status: false, message: 'Failed to delete contact' });
        }

    } catch (e) {
        console.log("Error:", e);
        res.status(500).json({ status: false, message: 'Server error', data: [] });
    }
});


module.exports = router