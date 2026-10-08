const MINIMOTH_BASE_URL = 'https://api.minimoth.dev';

async function sendOtp(phone) {
  const apiKey = process.env.MINIMOTH_API_KEY;

  if (!apiKey || apiKey === 'your_minimoth_api_key_here') {
    console.warn(`[Minimoth Demo] MINIMOTH_API_KEY is not configured. Simulating OTP send for ${phone}. Use code: 123456`);
    return { success: true, message: 'OTP sent (Demo mode: Use code 123456)' };
  }

  const response = await fetch(`${MINIMOTH_BASE_URL}/v1/otp/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ phone }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Minimoth error (${response.status})`);
  }

  return { success: true, data };
}

async function verifyOtp(phone, code) {
  const apiKey = process.env.MINIMOTH_API_KEY;

  if (!apiKey || apiKey === 'your_minimoth_api_key_here') {
    if (code === '123456') {
      return { success: true, verified: true };
    }
    throw new Error('Invalid OTP code. In demo mode, use 123456.');
  }

  const response = await fetch(`${MINIMOTH_BASE_URL}/v1/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ phone, code }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Minimoth verification failed (${response.status})`);
  }

  return { success: true, data };
}

module.exports = {
  sendOtp,
  verifyOtp,
};
