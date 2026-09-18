const fs = require('fs');

const files = [
  'src/app/listas-virales/page.tsx',
  'src/app/naturaleza-salvaje/page.tsx',
  'src/components/Sidebar.tsx'
];

const fixes = [
  [/Infogr[^\w\s]*ficas/g, 'Infográficas'],
  [/retenci[^\w\s]*n/g, 'retención'],
  [/Configuraci[^\w\s]*n/g, 'Configuración'],
  [/TEM[^\w\s]*TICA/g, 'TEMÁTICA'],
  [/Tem[^\w\s]*tica/g, 'Temática'],
  [/T[^\w\s]*tulos/g, 'Títulos'],
  [/Pol[^\w\s]*mico/g, 'Polémico'],
  [/Psicolog[^\w\s]*a/g, 'Psicología'],
  [/F[^\w\s]*sicos/g, 'Físicos'],
  [/a[^\w\s]*os/g, 'años'],
  [/Narraci[^\w\s]*n/g, 'Narración'],
  [/Edici[^\w\s]*n/g, 'Edición'],
  [/Animaci[^\w\s]*n/g, 'Animación'],
  [/M[^\w\s]*sica/g, 'Música'],
  [/M[^\w\s]*SICA/g, 'MÚSICA'],
  [/T[^\w\s]*TULO/g, 'TÍTULO'],
  [/Im[^\w\s]*genes/g, 'Imágenes'],
  [/L[^\w\s]*neas/g, 'Líneas'],
  [/Explicaci[^\w\s]*n/g, 'Explicación'],
  [/descripci[^\w\s]*n/g, 'descripción'],
  [/Descripci[^\w\s]*n/g, 'Descripción'],
  [/algor[^\w\s]*tmica/g, 'algorítmica'],
  [/Act[^\w\s]*a/g, 'Actúa'],
  [/T[^\w\s]*tulo/g, 'Título'],
  [/t[^\w\s]*tulo/g, 'título'],
  [/M[^\w\s]*s/g, 'Más'],
  [/m[^\w\s]*s/g, 'más'],
  [/pen[^\w\s]*ltimo/g, 'penúltimo'],
  [/pol[^\w\s]*mico/g, 'polémico'],
  [/NICAMENTE/g, 'ÚNICAMENTE'],
  [/MAY[^\w\s]*SCULAS/g, 'MAYÚSCULAS'],
  [/peque[^\w\s]*a/g, 'pequeña'],
  [/salvar[^\w\s]*'/g, 'salvará\\\''],
  [/dram[^\w\s]*ticos/g, 'dramáticos'],
  [/p[^\w\s]*pico/g, 'épico'], // Wait, this might match something else. E.g. épico -> ?picos
  [/[^\w\s]pico/g, 'épico'], // for épico 
  [/[^\w\s]picos/g, 'épicos'], // for épicos 
  [/Desgl[^\w\s]*salo/g, 'Desglósalo'],
  [/Sugi[^\w\s]*rele/g, 'Sugiérele']
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Custom replacements for broken chars
    content = content.replace(/Ã¡/g, 'á');
    content = content.replace(/Ã©/g, 'é');
    content = content.replace(/Ã­/g, 'í'); // i acute
    content = content.replace(/Ã³/g, 'ó');
    content = content.replace(/Ãº/g, 'ú');
    content = content.replace(/Ã±/g, 'ñ');
    content = content.replace(/Ã‘/g, 'Ñ');
    content = content.replace(/Ã /g, 'Á');
    content = content.replace(/Ã‰/g, 'É');
    content = content.replace(/Ã /g, 'Í');
    content = content.replace(/Ã“/g, 'Ó');
    content = content.replace(/Ãš/g, 'Ú');

    // PowerShell specific mojibake
    content = content.replace(/a/g, 'ó'); // "retencian"
    content = content.replace(/a/g, 'á'); 
    
    // Apply regex fallback
    fixes.forEach(fix => {
      content = content.replace(fix[0], fix[1]);
    });
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
