const express = require('express');
const router = express.Router();
const {
  getZakatSummary,
  getPayments,
  addPayment,
  updatePayment,
  deletePayment,
  deleteYearPayments,
  updateCycle,
  archiveCycle,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getZakatSummary);
router.get('/', getPayments);
router.post('/', addPayment);
router.put('/cycle', updateCycle);
router.post('/cycle/archive', archiveCycle);
router.delete('/year/:year', deleteYearPayments);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

module.exports = router;
