const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// This automatically targets your Cars.json file in this routes folder.
const jsonPath = path.join(__dirname, 'Cars.json');

// Helper to serve cars JSON
const serveCarsJson = (req, res) => {
    fs.readFile(jsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading Cars.json:", err);
            return res.status(500).json({ error: "Failed to read vehicle database" });
        }
        
        let cars = [];
        try {
            cars = JSON.parse(data);
        } catch (parseError) {
            console.error("Error parsing Cars.json:", parseError);
            return res.status(500).json({ error: "Failed to parse vehicle database" });
        }
        const { brand } = req.query;

        // If your frontend sends a brand filter (e.g., /api/cars?brand=Tata)
        if (brand) {
            const filteredCars = cars.filter(car => car.brand.toLowerCase() === brand.toLowerCase());
            return res.json(filteredCars);
        }

        // Default: return all cars
        res.json(cars);
    });
};

router.get('/', serveCarsJson);
router.get('/ev-models', serveCarsJson);

module.exports = router;
