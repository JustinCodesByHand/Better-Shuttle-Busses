const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helper: require @albany.edu email
function isUAlbanyEmail(email) {
    if (!email) return false;
    return email.toLowerCase().endsWith('@albany.edu');
}

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        if (!isUAlbanyEmail(email)) {
            return res
                .status(400)
                .json({ message: 'Please use a valid UAlbany email ending in @albany.edu.' });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ message: 'This email is already registered.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // We keep the existing "name" field in the model and build it
        const user = await User.create({
            name: `${firstName.trim()} ${lastName.trim()}`,
            email: email.toLowerCase(),
            passwordHash,
        });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'dev_secret',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                firstName,
                lastName,
                email: user.email,
            },
        });
    } catch (err) {
        console.error('Signup error', err);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

        if (!isUAlbanyEmail(user.email)) {
            // Just in case an old user exists somehow
            return res.status(400).json({ message: 'Account is not associated with albany.edu.' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(400).json({ message: 'Invalid email or password.' });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'dev_secret',
            { expiresIn: '7d' }
        );

        // Split "name" into first/last best effort
        const [firstName, ...rest] = (user.name || '').split(' ');
        const lastName = rest.join(' ');

        res.json({
            token,
            user: {
                id: user._id,
                firstName,
                lastName,
                email: user.email,
            },
        });
    } catch (err) {
        console.error('Login error', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;
