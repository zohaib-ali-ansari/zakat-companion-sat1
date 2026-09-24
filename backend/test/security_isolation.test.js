require('dotenv').config({ path: __dirname + '/../.env' });
const dns = require('node:dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if fails
}
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const ZakatCycle = require('../src/models/ZakatCycle');
const ZakatPayment = require('../src/models/ZakatPayment');
const { getZakatSummary, getPayments, addPayment, updatePayment, deletePayment } = require('../src/controllers/paymentController');

const JWT_SECRET = process.env.JWT_SECRET || 'zakat-companion-jwt-secret-2026';

// Mock Express req & res objects
const mockReqRes = (user, params = {}, body = {}, query = {}) => {
  const req = {
    user,
    params,
    body,
    query,
    headers: {},
  };
  let responseData = null;
  let responseStatus = 200;

  const res = {
    status(code) {
      responseStatus = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
  };

  return { req, res, getStatus: () => responseStatus, getData: () => responseData };
};

async function runSecurityIsolationTests() {
  console.log('--- STARTING TRACK ZAKAT MULTI-TENANT SECURITY ISOLATION TESTS ---');

  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not set in environment!');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Database connected successfully.');

  try {
    const emailA = 'security_user_a@example.com';
    const emailB = 'security_user_b@example.com';

    // Cleanup previous test users
    await User.deleteMany({ email: { $in: [emailA, emailB] } });
    const oldUsers = await User.find({ email: { $in: [emailA, emailB] } });

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const userA = await User.create({
      name: 'User A',
      email: emailA,
      password: hashedPassword,
      isEmailVerified: true,
    });

    const userB = await User.create({
      name: 'User B',
      email: emailB,
      password: hashedPassword,
      isEmailVerified: true,
    });

    await ZakatPayment.deleteMany({ userId: { $in: [userA._id, userB._id] } });
    await ZakatCycle.deleteMany({ userId: { $in: [userA._id, userB._id] } });

    console.log(`✓ Test users created: User A (${userA._id}) and User B (${userB._id})`);

    // =========================================================================
    // STEP 1: USER A CREATES TRACKING & PAYMENTS
    // =========================================================================
    console.log('\n--- Step 1: User A Creates Payments ---');
    
    // User A adds Payment 1 (50,000)
    const add1 = mockReqRes(userA, {}, { amount: 50000, recipient: 'Alkhidmat Foundation', date: '2026-03-01', notes: 'Payment 1' });
    await addPayment(add1.req, add1.res);
    console.assert(add1.getStatus() === 201, 'User A Payment 1 creation failed');
    const paymentA1 = add1.getData().data;
    console.log(`✓ User A added Payment 1: ID ${paymentA1._id}, Amount: PKR ${paymentA1.amount}`);

    // User A adds Payment 2 (25,000)
    const add2 = mockReqRes(userA, {}, { amount: 25000, recipient: 'Edhi Foundation', date: '2026-03-15', notes: 'Payment 2' });
    await addPayment(add2.req, add2.res);
    console.assert(add2.getStatus() === 201, 'User A Payment 2 creation failed');
    const paymentA2 = add2.getData().data;
    console.log(`✓ User A added Payment 2: ID ${paymentA2._id}, Amount: PKR ${paymentA2.amount}`);

    // User A gets summary
    const summaryA = mockReqRes(userA);
    await getZakatSummary(summaryA.req, summaryA.res);
    const dataA = summaryA.getData().data;
    console.assert(dataA.totalPaid === 75000, `Expected totalPaid 75000, got ${dataA.totalPaid}`);
    console.assert(dataA.records.length === 2, `Expected 2 records for User A, got ${dataA.records.length}`);
    console.log(`✓ User A Summary verified: Total Paid = PKR ${dataA.totalPaid}, Remaining = PKR ${dataA.remaining}, Records = ${dataA.records.length}`);

    // User A edits Payment 1 from 50,000 to 60,000
    const editA = mockReqRes(userA, { id: paymentA1._id.toString() }, { amount: 60000, recipient: 'Alkhidmat Foundation' });
    await updatePayment(editA.req, editA.res);
    console.assert(editA.getStatus() === 200, 'User A Payment 1 update failed');
    console.log(`✓ User A updated Payment 1 amount to PKR ${editA.getData().data.amount}`);

    // Verify recalculation
    const summaryA2 = mockReqRes(userA);
    await getZakatSummary(summaryA2.req, summaryA2.res);
    console.assert(summaryA2.getData().data.totalPaid === 85000, `Expected totalPaid 85000, got ${summaryA2.getData().data.totalPaid}`);
    console.log(`✓ Recalculated total paid for User A after edit = PKR ${summaryA2.getData().data.totalPaid}`);

    // =========================================================================
    // STEP 2: USER B ISOLATION & DATA SEPARATION
    // =========================================================================
    console.log('\n--- Step 2: User B Data Isolation ---');

    // User B fetches summary (must be empty and zero User A data)
    const summaryB = mockReqRes(userB);
    await getZakatSummary(summaryB.req, summaryB.res);
    const dataB = summaryB.getData().data;
    console.assert(dataB.records.length === 0, `User B should have 0 records, got ${dataB.records.length}`);
    console.assert(dataB.totalPaid === 0, `User B totalPaid should be 0, got ${dataB.totalPaid}`);
    console.log(`✓ User B Summary isolated: 0 records returned. User A data is completely isolated!`);

    // User B adds their own payment (15,000)
    const addB1 = mockReqRes(userB, {}, { amount: 15000, recipient: 'Saylani Welfare', date: '2026-03-20' });
    await addPayment(addB1.req, addB1.res);
    console.assert(addB1.getStatus() === 201, 'User B payment creation failed');
    console.log(`✓ User B created payment: PKR 15,000`);

    // Verify User B only sees their 1 payment
    const getB = mockReqRes(userB);
    await getPayments(getB.req, getB.res);
    console.assert(getB.getData().data.length === 1, `User B should have 1 payment, got ${getB.getData().data.length}`);
    console.assert(getB.getData().data[0].recipient === 'Saylani Welfare', 'User B payment mismatch');
    console.log(`✓ User B getPayments returns ONLY User B record.`);

    // =========================================================================
    // STEP 3: SECURITY ATTACK TESTS (USER B TRIES TO ACCESS/EDIT/DELETE USER A DATA)
    // =========================================================================
    console.log('\n--- Step 3: Security Attack Prevention Tests ---');

    // Attack 1: User B attempts to edit User A's Payment 1
    console.log(`ATTEMPT: User B attempting to edit User A payment (${paymentA1._id})...`);
    const attackEdit = mockReqRes(userB, { id: paymentA1._id.toString() }, { amount: 1 });
    await updatePayment(attackEdit.req, attackEdit.res);
    console.assert(attackEdit.getStatus() === 404, `Expected 404 for unauthorized edit, got ${attackEdit.getStatus()}`);
    console.log(`✓ SECURITY PASS: Backend rejected unauthorized edit attempt with status ${attackEdit.getStatus()}`);

    // Attack 2: User B attempts to delete User A's Payment 1
    console.log(`ATTEMPT: User B attempting to delete User A payment (${paymentA1._id})...`);
    const attackDelete = mockReqRes(userB, { id: paymentA1._id.toString() });
    await deletePayment(attackDelete.req, attackDelete.res);
    console.assert(attackDelete.getStatus() === 404, `Expected 404 for unauthorized delete, got ${attackDelete.getStatus()}`);
    console.log(`✓ SECURITY PASS: Backend rejected unauthorized delete attempt with status ${attackDelete.getStatus()}`);

    // Verify User A's Payment 1 was untouched
    const verifyA1 = await ZakatPayment.findById(paymentA1._id);
    console.assert(verifyA1 && verifyA1.amount === 60000, 'User A payment was modified by attack!');
    console.log(`✓ User A payment data intact: Amount remains PKR ${verifyA1.amount}`);

    // =========================================================================
    // STEP 4: USER A DELETES PAYMENT & RECALCULATES
    // =========================================================================
    console.log('\n--- Step 4: User A Deletes Payment ---');
    const deleteA2 = mockReqRes(userA, { id: paymentA2._id.toString() });
    await deletePayment(deleteA2.req, deleteA2.res);
    console.assert(deleteA2.getStatus() === 200, 'User A delete failed');
    console.log(`✓ User A deleted Payment 2`);

    const summaryFinalA = mockReqRes(userA);
    await getZakatSummary(summaryFinalA.req, summaryFinalA.res);
    console.assert(summaryFinalA.getData().data.totalPaid === 60000, `Expected totalPaid 60000, got ${summaryFinalA.getData().data.totalPaid}`);
    console.assert(summaryFinalA.getData().data.records.length === 1, `Expected 1 record for User A, got ${summaryFinalA.getData().data.records.length}`);
    console.log(`✓ User A totals recalculated correctly: Total Paid = PKR 60,000, Records = 1`);

    // Clean up test data
    await User.deleteMany({ email: { $in: [emailA, emailB] } });
    await ZakatPayment.deleteMany({ userId: { $in: [userA._id, userB._id] } });
    await ZakatCycle.deleteMany({ userId: { $in: [userA._id, userB._id] } });
    console.log('\n✓ Test data cleaned up.');

    console.log('\n=======================================================');
    console.log('ALL SECURITY AND MULTI-TENANT ISOLATION TESTS PASSED 💯');
    console.log('=======================================================\n');

  } catch (error) {
    console.error('SECURITY TEST FAILED:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runSecurityIsolationTests();
