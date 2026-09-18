require('dotenv').config({ path: '.env.local' });
const { chatCompletion } = require('./src/lib/api-helpers');

async function run() {
  try {
    const { POST } = require('./.next/server/app/api/generate-motivational/route.js');
    
    // We can't easily call POST without a proper NextRequest object. 
    // Let's just check if there is an obvious JS error by constructing a mock request.
  } catch(e) {
    console.error(e);
  }
}
run();
