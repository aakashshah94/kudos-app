// Simulate a gift card vendor API for local dev
module.exports = {
  async redeem(vendorCode, amount, userId) {
    // Always succeed for pilot, predictable code
    return {
      success: true,
      code: `${vendorCode}-${amount}-${userId}`.slice(0, 32),
      message: 'Mock redemption successful',
      fulfilledAt: new Date().toISOString(),
    };
  }
};
