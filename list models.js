 const { GoogleGenerativeAI } = require('@google/generative-ai');
    2
    3     const API_KEY = process.env.GEMINI_API_KEY;
    4
    5     if (!API_KEY) {
    6         console.error('GEMINI_API_KEY environment variable is not set.');
    7         process.exit(1);
    8     }
    9
   10     async function listModels() {
   11         const genAI = new GoogleGenerativeAI(API_KEY);
   12         try {
   13             const { models } = await genAI.listModels();
   14             console.log('Available Models:');
   15             for (const model of models) {
   16                 console.log(`- ${model.name} (Supports:
      ${model.supportedGenerationMethods.join(', ')})`);
   17             }
   18         } catch (error) {
   19             console.error('Error listing models:', error);
   20         }
   21     }
   22
   23     listModels();
