const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        default: "",
    },
    otp: {
        type: String,
        trim: true,
        default: "",
    },
    otp_expiry: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

// Pre-save middleware to update the updated_at field
otpSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Otp', otpSchema);