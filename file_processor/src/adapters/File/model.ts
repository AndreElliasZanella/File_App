const mongoose = require('mongoose');
const { Schema } = mongoose;

const fileSchema = new Schema({
    key: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['png', 'jpg', 'jpeg'],
        required: true,
    },
    operation: {
        type: String,
        enum: ['hearts', 'spades', 'diamonds', 'clubs'],
        required: true,
    },
}, {
    timestamps: true,
});

export const FileModel = mongoose.model('FileModel', fileSchema);
