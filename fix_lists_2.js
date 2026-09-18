const fs = require('fs');
let file = 'src/app/listas-virales/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Listas Infogr.+ficas/g, "Listas Infográficas");
content = content.replace(/retenci.+n infinita/g, "retención infinita");
content = content.replace(/Configuraci.+n del Nicho/g, "Configuración del Nicho");
content = content.replace(/Tem.+tica \/ Nicho/g, "Temática / Nicho");
content = content.replace(/Generar T.+tulos Virales/g, "Generar Títulos Virales");
content = content.replace(/C.+DIGO Y TEXTO COPIABLE/g, "CÓDIGO Y TEXTO COPIABLE");
content = content.replace(/HOOK \(T.+TULO PRINCIPAL\)/g, "HOOK (TÍTULO PRINCIPAL)");
content = content.replace(/INFORMACI.+N/g, "INFORMACIÓN");
content = content.replace(/PREVISUALIZACI.+N ESTILO/g, "PREVISUALIZACIÓN ESTILO");
content = content.replace(/\+[0-9]+ puntos m.+s\.\.\./g, match => {
  return match.replace(/m.+s/, "más");
});
content = content.replace(/este dise.+o como/g, "este diseño como");

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed listas-virales/page.tsx (retry)");
