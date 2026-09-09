const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file === 'route.ts') {
            let content = fs.readFileSync(fullPath, 'utf8');

            // 1. Remove the global Groq instantiation
            content = content.replace(/const groq = new Groq\(\{\s*apiKey:\s*process\.env\.GROQ_API_KEY\s*\}\);\n/g, '');

            // 2. Add _provider extraction to req.json()
            if (content.includes('await req.json();') && !content.includes('_provider')) {
                content = content.replace(
                    /const\s+\{([^}]+)\}\s*=\s*await\s+req\.json\(\);/g,
                    (match, vars) => {
                        return `const { ${vars.trim()}, _provider } = await req.json();`;
                    }
                );
            }

            // 3. Inject dynamic Groq instantiation inside the route logic, before chatCompletion
            // We need to find where chatCompletion happens and inject it before.
            // A safer way is to inject it right after req.json() extraction.
            if (!content.includes('const groq = new Groq(')) {
                content = content.replace(
                    /(const\s+\{.*_provider.*\}\s*=\s*await\s+req\.json\(\);)/g,
                    `$1\n\n    const groq = new Groq({ apiKey: _provider?.apiKey || process.env.GROQ_API_KEY });\n    const aiModel = _provider?.model || "llama-3.3-70b-versatile";`
                );
            }

            // 4. Replace hardcoded model with aiModel
            content = content.replace(/model:\s*"openai\/gpt-oss-120b"/g, 'model: aiModel');
            
            // 5. If there are other hardcoded models, replace them too
            content = content.replace(/model:\s*"llama3-70b-8192"/g, 'model: aiModel');
            
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated ${fullPath}`);
        }
    }
}

processDir(apiDir);
console.log('Done');
