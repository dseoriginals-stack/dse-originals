import axios from 'axios';
import 'dotenv/config';

const key = process.env.XENDIT_SECRET_KEY?.replace(/['"]/g, "").trim();
const auth = Buffer.from(key + ':').toString('base64');

async function testKey() {
  console.log('Testing Key:', key.substring(0, 15) + '...');
  try {
    const res = await axios.get('https://api.xendit.co/v2/invoices?limit=1', {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    console.log('✅ Key is VALID (Invoices access)!');
  } catch (err) {
    console.error('❌ Key is INVALID!', err.response?.status, err.response?.data);
  }
}

testKey();
