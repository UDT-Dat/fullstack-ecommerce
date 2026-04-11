const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String },
    content: { type: String, required: true },
    thumbnail: { type: String, default: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800' },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    author: { type: String, default: 'Admin' },
    views: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Create text index for simple searches
postSchema.index({ title: 'text', summary: 'text', content: 'text' });

module.exports = mongoose.model('Post', postSchema);
