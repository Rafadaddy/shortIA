const fs = require('fs');
let file = 'src/app/listas-virales/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace using wildcard matches for the corrupted parts to avoid typing the exact mojibake
content = content.replace(/Listas Infogr[^\s]+ficas/g, "Listas Infográficas");
content = content.replace(/retenci[^\s]+n/g, "retención");
content = content.replace(/Configuraci[^\s]+n/g, "Configuración");
content = content.replace(/Tem[^\s]+tica/g, "Temática");
content = content.replace(/T[^\s]+tulos/g, "Títulos");
content = content.replace(/C[^\s]+DIGO Y TEXTO/g, "CÓDIGO Y TEXTO");
content = content.replace(/HOOK \(T[^\s]+TULO PRINCIPAL\)/g, "HOOK (TÍTULO PRINCIPAL)");
content = content.replace(/INFORMACI[^\s]+N/g, "INFORMACIÓN");
content = content.replace(/PREVISUALIZACI[^\s]+N ESTILO/g, "PREVISUALIZACIÓN ESTILO");
content = content.replace(/\+[0-9]+ puntos m[^\s]+s\.\.\./g, match => {
  return match.replace(/m.+s/, "más");
});
content = content.replace(/este dise[^\s]+o como/g, "este diseño como");

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed listas-virales/page.tsx");
