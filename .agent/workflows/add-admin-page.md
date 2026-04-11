---
description: How to add a new admin CRUD page in the dashboard
---

## Add a New Admin CRUD Page

### 1. Create the Admin Page Component

Create `src/pages/admin/YourPage.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import AdminSearchBar, { fuzzyMatch } from '../../components/AdminSearchBar';

const YourPage = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const { showToast } = useToast();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/your-endpoint', { headers });
            setItems(res.data);
        } catch (err) {
            showToast('Lỗi tải dữ liệu', 'error');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-headline font-black mb-8">Quản lý ...</h1>
            {/* Table / Cards / Form here */}
        </div>
    );
};

export default YourPage;
```

**Design rules:**
- Follow existing admin page patterns (table layout, modal forms, search bar)
- Use `ConfirmModal` for delete confirmations
- Use `AdminSearchBar` with `fuzzyMatch` for filtering
- Use `showToast()` for all success/error feedback

### 2. Add Route in App.jsx

In `src/App.jsx`, add inside the `<Route path="/admin">` group:
```jsx
import YourPage from './pages/admin/YourPage';
// ...
<Route path="your-page" element={<YourPage />} />
```

### 3. Add Sidebar Link in AdminLayout.jsx

In `src/pages/admin/AdminLayout.jsx`, add to the navigation items array:
```jsx
{ to: '/admin/your-page', icon: 'icon_name', label: 'Tên Mục' }
```

### 4. Ensure Backend API Exists

Make sure the corresponding API routes and controller exist (see `add-api-feature` workflow).
