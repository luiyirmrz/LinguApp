#!/usr/bin/env node

// Test the validation functions directly
const { validateEmail, validatePassword, validateName } = require('../utils/validation.ts');

console.log('🧪 Testing validation functions...');

// Test email validation
console.log('\n📧 Testing email validation:');
const emailResult = validateEmail('newuser@example.com');
console.log('Email validation result:', emailResult);

// Test password validation  
console.log('\n🔒 Testing password validation:');
const passwordResult = validatePassword('TestPass123!');
console.log('Password validation result:', passwordResult);

// Test name validation
console.log('\n👤 Testing name validation:');
const nameResult = validateName('Test User');
console.log('Name validation result:', nameResult);

console.log('\n✅ Validation tests completed!');
