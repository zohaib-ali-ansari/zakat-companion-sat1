const express = require('express');
const router = express.Router();
const { getMetalRates, updateMetalRates } = require('../controllers/metalRateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getMetalRates);
router.get('/nisab', getMetalRates);
router.post('/', protect, updateMetalRates);

module.exports = router;
