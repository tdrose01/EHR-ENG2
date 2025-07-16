const express = require('express');
const router = express.Router();
const { getAllWaterTests, createWaterTest } = require('../models/waterTestModel');

// Get all water tests
router.get('/', async (req, res) => {
    try {
        const tests = await getAllWaterTests();
        res.json(tests);
    } catch (err) {
        console.error('Error fetching water tests:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new water test
router.post('/', async (req, res) => {
    try {
        const newTest = await createWaterTest(req.body);
        res.status(201).json(newTest);
    } catch (err) {
        console.error('Error creating water test:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
