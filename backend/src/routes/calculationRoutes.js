const express = require('express');
const router = express.Router();
const {
  computeZakat,
  saveCalculation,
  getUserCalculations,
  getLatestCalculation,
  deleteCalculation,
} = require('../controllers/calculationController');
const { protect } = require('../middleware/authMiddleware');

// Public/Optional auth preview compute
router.post('/compute', computeZakat);

// Protected user calculations
router.use(protect);
router.post('/', saveCalculation);
router.get('/', getUserCalculations);
router.get('/latest', getLatestCalculation);
router.delete('/:id', deleteCalculation);

module.exports = router;
