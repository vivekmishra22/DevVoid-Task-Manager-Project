const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    console.log('🧪 Testing Gemini API...');
    console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? '✅ Present' : '❌ Missing');
    
    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ Please add GEMINI_API_KEY to your .env file');
      return;
    }

    // Try different model names
    const modelNames = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-001',
      'gemini-1.0-pro',
      'gemini-1.0-pro-001',
      'gemini-pro',
      'models/gemini-pro'
    ];

    for (let modelName of modelNames) {
      try {
        console.log(`\n🔄 Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, say 'API is working with " + modelName + "!'");
        const response = await result.response;
        
        console.log(`✅ SUCCESS with ${modelName}:`, response.text());
        console.log(`🎉 Use this model in your code: ${modelName}`);
        return; // Stop after first successful model
      } catch (modelError) {
        console.log(`❌ ${modelName}: ${modelError.message}`);
      }
    }

    console.log('\n❌ All model tests failed. Please check your API key and internet connection.');

  } catch (error) {
    console.error('❌ General Gemini API Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('🔑 Please check your API key in Google AI Studio');
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      console.log('🔄 The model names might have changed. Check Google AI documentation.');
    } else {
      console.log('🌐 Please check your internet connection');
    }
  }
}

testGemini();

// const { GoogleGenerativeAI } = require('@google/generative-ai');
// require('dotenv').config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function testGemini() {
//   try {
//     console.log('Testing Gemini API...');
//     console.log('API Key:', process.env.GEMINI_API_KEY ? '✅ Present' : '❌ Missing');
    
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//     const result = await model.generateContent("Hello, say 'API is working!'");
//     const response = await result.response;
    
//     console.log('✅ Gemini API Response:', response.text());
//   } catch (error) {
//     console.error('❌ Gemini API Error:', error.message);
//     console.log('Please check:');
//     console.log('1. API key is correct');
//     console.log('2. API key is enabled in Google AI Studio');
//     console.log('3. You have internet connection');
//   }
// }

// testGemini();