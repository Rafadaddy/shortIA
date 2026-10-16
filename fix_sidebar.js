const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// The corrupted block is:
//           <Link href="/timeline" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-emerald-400 active:text-emerald-400 min-w-[4rem] flex-shrink-0">
//           <History className="w-5 h-5" />
//           <span className="text-[10px] font-medium">Líneas</span>
//         </Link>
//         <Link href="/cuerpo-humano" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-red-500 active:text-red-500 min-w-[4rem] flex-shrink-0">
//           <Activity className="w-5 h-5" />
//           <span className="text-[10px] font-medium">Cuerpo</span>
//         </Link>

const corruptedDesktopBlock = `<Link href="/timeline" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-emerald-400 active:text-emerald-400 min-w-[4rem] flex-shrink-0">
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">Líneas</span>
        </Link>
        <Link href="/cuerpo-humano" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-red-500 active:text-red-500 min-w-[4rem] flex-shrink-0">
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-medium">Cuerpo</span>
        </Link>`;

const fixedDesktopBlock = `<Link href="/timeline" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <History className="w-5 h-5 text-emerald-400" />
            Líneas de Tiempo
          </Link>`;

content = content.replace(corruptedDesktopBlock, fixedDesktopBlock);

// Now, correctly insert the mobile link for "Cuerpo Humano" AFTER the true mobile "Líneas" link:
const trueMobileTimelineLink = `<Link href="/timeline" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-emerald-400 active:text-emerald-400 min-w-[4rem] flex-shrink-0">
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">Líneas</span>
        </Link>`;

const trueMobileTimelineAndCuerpo = `<Link href="/timeline" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-emerald-400 active:text-emerald-400 min-w-[4rem] flex-shrink-0">
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">Líneas</span>
        </Link>
        <Link href="/cuerpo-humano" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-red-500 active:text-red-500 min-w-[4rem] flex-shrink-0">
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-medium">Cuerpo</span>
        </Link>`;

content = content.replace(trueMobileTimelineLink, trueMobileTimelineAndCuerpo);

fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
console.log('Sidebar perfectly patched');
