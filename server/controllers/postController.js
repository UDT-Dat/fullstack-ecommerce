const Post = require('../models/Post');

// Generate simple slug from title
const generateSlug = (title) => {
    return title.toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

// PUBLIC: Get published posts
exports.getPublicPosts = async (req, res) => {
    try {
        const posts = await Post.find({ status: 'published' })
            .select('-content') // exclude heavy content for listing
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUBLIC: Get post by slug
exports.getPostBySlug = async (req, res) => {
    try {
        const post = await Post.findOneAndUpdate(
            { slug: req.params.slug, status: 'published' },
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!post) return res.status(404).json({ message: "Bài viết không tồn tại hoặc chưa được xuất bản." });
        
        // Also fetch 3 latest posts for the sidebar
        const recentPosts = await Post.find({ status: 'published', _id: { $ne: post._id } })
            .sort({ createdAt: -1 })
            .limit(4)
            .select('title slug thumbnail createdAt views');

        res.status(200).json({ post, recentPosts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADMIN: Get all posts
exports.getAllPostsAdmin = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADMIN: Create post
exports.createPost = async (req, res) => {
    try {
        const { title, summary, content, thumbnail, tags, status } = req.body;
        
        let slug = generateSlug(title);
        // check slug exist
        const exist = await Post.findOne({ slug });
        if (exist) slug = `${slug}-${Date.now().toString().slice(-4)}`;

        const newPost = new Post({
            title, slug, summary, content, thumbnail, tags, status,
            author: req.user.name || 'Admin'
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADMIN: Update post
exports.updatePost = async (req, res) => {
    try {
        const { title, slug, summary, content, thumbnail, tags, status } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Bài viết không tồn tại!" });

        // If title changed and no explicit slug provided, generate new
        let newSlug = slug;
        if (title !== post.title && (!newSlug || newSlug === post.slug)) {
             newSlug = generateSlug(title);
             const exist = await Post.findOne({ slug: newSlug, _id: { $ne: post._id } });
             if (exist) newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
        }

        const updated = await Post.findByIdAndUpdate(req.params.id, {
            title, slug: newSlug, summary, content, thumbnail, tags, status
        }, { new: true });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADMIN: Delete post
exports.deletePost = async (req, res) => {
    try {
        const deleted = await Post.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Bài viết không tồn tại!" });
        res.status(200).json({ message: "Xóa bài viết thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
