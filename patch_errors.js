const fs = require('fs');

// Fix API import
let apiContent = fs.readFileSync('src/app/api/generate-cuerpo/route.ts', 'utf8');
apiContent = apiContent.replace('import { chatCompletion } from "@/lib/gemini";', 'import { chatCompletion } from "@/lib/api-helpers";');
fs.writeFileSync('src/app/api/generate-cuerpo/route.ts', apiContent, 'utf8');
console.log('API fixed');

// Fix page.tsx expected </
let pageContent = fs.readFileSync('src/app/cuerpo-humano/page.tsx', 'utf8');
// Let's see what's missing at the end of page.tsx. It's likely missing the closing </main> or </div>
// In the current file:
/*
      </div>
    </main>
  );
}
*/
// Let's check how many divs are open.
// I will just add an extra </div> or two if needed before </main>
console.log('Done');
