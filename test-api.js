// Test API endpoints
const tests = [
  {
    name: 'Admin Login',
    method: 'POST',
    url: '/api/admin/auth/login',
    body: {
      email: 'admin@mahfza.com',
      password: 'admin123456',
      captchaId: 'test-token',
      captchaAnswer: 'test-token'
    }
  },
  {
    name: 'Get Customers',
    method: 'GET',
    url: '/api/customers',
    headers: { 'Authorization': 'Bearer will-be-set-after-login' }
  },
  {
    name: 'Get Packages',
    method: 'GET',
    url: '/api/packages',
    headers: { 'Authorization': 'Bearer will-be-set-after-login' }
  },
  {
    name: 'Get Subscriptions',
    method: 'GET',
    url: '/api/subscriptions',
    headers: { 'Authorization': 'Bearer will-be-set-after-login' }
  },
  {
    name: 'Get Invoices',
    method: 'GET',
    url: '/api/invoices',
    headers: { 'Authorization': 'Bearer will-be-set-after-login' }
  },
  {
    name: 'Get Audit Logs',
    method: 'GET',
    url: '/api/audit-logs',
    headers: { 'Authorization': 'Bearer will-be-set-after-login' }
  }
];

console.log('API Endpoint Tests:');
console.log('==================');
tests.forEach((test, index) => {
  console.log(`${index + 1}. ${test.name}`);
  console.log(`   ${test.method} ${test.url}`);
  if (test.body) {
    console.log(`   Body:`, JSON.stringify(test.body, null, 2));
  }
  if (test.headers) {
    console.log(`   Headers:`, JSON.stringify(test.headers, null, 2));
  }
  console.log('');
});

console.log('To test these endpoints, run:');
console.log('1. Login to get auth token');
console.log('2. Use token in Authorization header for protected endpoints');
console.log('3. Check responses for proper data structure');