// Version 1.1.0-dev - Development Server (with Hotfix v1.0.1 integrated)
const express = require('express');
const app = express();

// SECURITY FIX: Remove password from debug log to prevent data leak (merged from hotfix/v1.0.1)
app.get('/api/user/profile', (req, res) => {
    const { username } = req.query;
    console.log(`[SECURITY SECURE] User auth request - User: ${username}`); // Log sanitized (password removed)
    res.json({ status: "success", user: username });
});

// WIP FEATURE for v1.1.0: Analytics API
app.get('/api/analytics', (req, res) => {
    res.json({ status: "wip", metric: "active_users", value: 1050 });
});

app.listen(3000, () => console.log('Server running on port 3000 - v1.1.0-dev'));
