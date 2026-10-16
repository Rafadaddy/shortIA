const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Ensure lucide-react imports have Activity
if (!content.includes('Activity')) {
  content = content.replace(/import\s+{([^}]+)}\s+from\s+"lucide-react";/, 'import { $1, Activity } from "lucide-react";');
}

const desktopLink = `          <Link href="/listas-virales" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <ListOrdered className="w-5 h-5 text-emerald-400" />
            Listas Virales
          </Link>
          <Link href="/cuerpo-humano" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Activity className="w-5 h-5 text-red-500" />
            Cuerpo Humano
          </Link>`;

content = content.replace(/<Link href="\/listas-virales"[\s\S]*?<\/Link>/, desktopLink);

const mobileLink = `<Link href="/timeline" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-emerald-400 active:text-emerald-400 min-w-[4rem] flex-shrink-0">
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">Líneas</span>
        </Link>
        <Link href="/cuerpo-humano" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-red-500 active:text-red-500 min-w-[4rem] flex-shrink-0">
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-medium">Cuerpo</span>
        </Link>`;

content = content.replace(/<Link href="\/timeline"[\s\S]*?<\/Link>/, mobileLink);

fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
console.log('Sidebar updated');
