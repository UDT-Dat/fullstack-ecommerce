---
description: How to add a new API feature (model, controller, route)
---

## Add a New API Feature

Follow these steps to add new backend functionality end-to-end.

### 1. Create the Mongoose Model

Create `server/models/YourModel.js`:
```javascript
const mongoose = require('mongoose');

const yourModelSchema = new mongoose.Schema({
    fieldName: { type: String, required: true },
    // ... define fields
}, { timestamps: true });

module.exports = mongoose.model('YourModel', yourModelSchema);
```

**Rules:**
- File name: PascalCase, singular (e.g., `Product.js`, `Order.js`)
- Always add `{ timestamps: true }` for `createdAt` / `updatedAt`

### 2. Create the Controller

Create `server/controllers/yourModelController.js`:
```javascript
const YourModel = require('../models/YourModel');

exports.getAll = async (req, res) => {
    try {
        const items = await YourModel.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        console.error('Error in getAll:', error);
        res.status(500).json({ message: error.message });
    }
};
```

**Rules:**
- File name: camelCase + "Controller" suffix
- Every function: `async/await` wrapped in `try/catch`
- Always `console.error` in `catch` blocks
- Use proper HTTP status codes: 200, 201, 400, 404, 500

### 3. Create the Route

Create `server/routes/yourModelRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getAll, create } = require('../controllers/yourModelController');

router.get('/', getAll);
router.post('/', auth, create);  // Protected routes use auth middleware

module.exports = router;
```

### 4. Register in server.js

Add to `server/server.js`:
```javascript
const yourModelRoutes = require('./routes/yourModelRoutes');
// ... after other route imports

app.use('/api/your-model', yourModelRoutes);
// ... after other app.use() calls
```

### 5. (Optional) Add shared logic to Services

If the logic needs to be called from multiple controllers, create `server/services/yourService.js`:
```javascript
const someHelper = async (param) => {
    try {
        // logic here
    } catch (error) {
        console.error('Service error:', error);
        throw error;
    }
};

module.exports = { someHelper };
```

### 6. Connect from Frontend

```javascript
// In your React component
const response = await axios.get('http://localhost:5000/api/your-model');
// For protected routes:
const response = await axios.post('http://localhost:5000/api/your-model', payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```
