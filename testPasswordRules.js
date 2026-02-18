const validatePassword = require('./utils/passwordValidator');

const testCases = [
    { password: 'weak', expected: false, desc: 'Too short' },
    { password: 'password123', expected: false, desc: 'No uppercase, no special' },
    { password: 'Password123', expected: false, desc: 'No special char' },
    { password: 'Password!', expected: false, desc: 'No number' },
    { password: 'PASSWORD123!', expected: false, desc: 'No lowercase' },
    { password: 'Pass123', expected: false, desc: 'Too short but mixed' },
    { password: 'Password123!', expected: true, desc: 'Valid password' },
    { password: 'Strong@Password1', expected: true, desc: 'Valid long password' }
];

console.log('Running Password Validation Tests...\n');

let passed = 0;
testCases.forEach((test, index) => {
    const result = validatePassword(test.password);
    const status = result.isValid === test.expected ? 'PASS' : 'FAIL';
    if (status === 'PASS') passed++;

    console.log(`Test ${index + 1}: ${test.desc}`);
    console.log(`Password: ${test.password}`);
    console.log(`Expected: ${test.expected}, Got: ${result.isValid}`);
    if (!result.isValid) {
        console.log(`Errors: ${result.errors.join(', ')}`);
    }
    console.log(`Status: ${status}\n`);
});

console.log(`Total Passed: ${passed}/${testCases.length}`);
if (passed === testCases.length) {
    console.log('All tests passed!');
    process.exit(0);
} else {
    console.log('Some tests failed.');
    process.exit(1);
}
