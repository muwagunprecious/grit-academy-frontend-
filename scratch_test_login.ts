import axios from 'axios';

async function testLocalLogin() {
  console.log('Testing local login to http://localhost:5000/api/auth/login...');
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@gritacademy.com',
      password: 'adminpassword123'
    });
    console.log('✅ Local login success:', res.data?.status, res.data?.data?.user?.email);
  } catch (err: any) {
    console.log('❌ Local login error:', err.response?.data?.message || err.message);
  }
}

async function testVercelLogin() {
  console.log('\nTesting Vercel backend login to https://grit-academy-backend-nu.vercel.app/api/auth/login...');
  try {
    const res = await axios.post('https://grit-academy-backend-nu.vercel.app/api/auth/login', {
      email: 'admin@gritacademy.com',
      password: 'adminpassword123'
    });
    console.log('✅ Vercel login success:', res.data?.status, res.data?.data?.user?.email);
  } catch (err: any) {
    console.log('❌ Vercel login error:', err.response?.data?.message || err.message);
  }
}

async function main() {
  await testLocalLogin();
  await testVercelLogin();
}

main();
