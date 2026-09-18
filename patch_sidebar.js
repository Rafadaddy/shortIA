const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const desktopLink = `          <Link href="/listas-virales" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <ListOrdered className="w-5 h-5 text-emerald-400" />
            Listas Virales
          </Link>\n`;

const mobileLink = `        <Link href="/listas-virales" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-emerald-400 active:text-emerald-400 min-w-[4rem] flex-shrink-0">
          <ListOrdered className="w-5 h-5" />
          <span className="text-[10px] font-medium">Listas</span>
        </Link>\n`;

content = content.replace(
  '<Link href="/videos-motivacionales" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">',
  desktopLink + '          <Link href="/videos-motivacionales" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">'
);

content = content.replace(
  '<Link href="/videos-motivacionales" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-amber-400 active:text-amber-400 min-w-[4rem] flex-shrink-0">',
  mobileLink + '        <Link href="/videos-motivacionales" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-amber-400 active:text-amber-400 min-w-[4rem] flex-shrink-0">'
);

content = content.replace('import { ', 'import { ListOrdered, ');

fs.writeFileSync('src/components/Sidebar.tsx', content);
