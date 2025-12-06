function cleanName(name) {
    if (!name) return '';
    const VALID_COUNTRY_CODES = new Set(['CZE']);
    const cleaned = name
        .replace(/\s+-\s+/g, '-')
        .replace(/-\s+/g, '-')
        .replace(/\s+-/g, '-')
        .replace(/([A-Z])\s+([ØÖÜÄÉÈÀÓÅÍ])\s+([A-Z])/g, '$1$2$3')
        .replace(/([A-Z])\s+([ØÖÜÄÉÈÀÓÅÍ])(?=\s|$)/g, '$1$2')
        .replace(/(^|\s)([ØÖÜÄÉÈÀÓÅÍ])\s+([A-Z])/g, '$1$2$3')
        .replace(/([a-z])\s+([øöüäéèàóåí])\s+([a-z])/g, '$1$2$3')
        .replace(/Bj\s+ø\s+rn/g, 'Bjørn')
        .replace(/Metod\s+j/g, 'Metoděj')
        .replace(/Metod\s*ě\s*j/g, 'Metoděj')
        .replace(/And\s+elika/g, 'Andżelika')
        .replace(/W\s+Ó\s+JCIK/g, 'WÓJCIK')
        .replace(/Sebas\s+Diniz/gi, 'Sebastian Diniz')
        .replace(/Damian\s+Urek/gi, 'Damian Żurek')
        .replace(/Damian\s+Zurek/gi, 'Damian Żurek')
        .replace(/Yuta\s+Hirose/gi, 'Yuuta Hirose')
        .replace(/Altay\s+Zhardembekuly/gi, 'Altaj Zhardembekuly')
        .replace(/Gabriel\s+Gro\s+SS/gi, 'Gabriel Groß')
        .replace(/David\s+La\s+Rue/gi, 'David Larue')
        .replace(/Antoine\s+G\s*[ée]\s*linas\s*-\s*Beaulieu/gi, 'Antoine Gélinas-Beaulieu')
        .replace(/Antoine\s+G\s*[ée]\s*linas\s*-\s*Beaulieu/gi, 'Antoine Gélinas-Beaulieu')
        .replace(/Antoine\s+G\s*[ée]\s*linas\s+Beaulieu/gi, 'Antoine Gélinas-Beaulieu')
        .replace(/G[ée]linas\s+Beaulieu/gi, 'Gélinas-Beaulieu')
        .replace(/Brooklyn\s+Mcdougall/gi, 'Brooklyn McDougall')
        .replace(/Metoděj\s+J\s*Í\s*Lek/gi, 'Metoděj Jílek')
        .replace(/Metoděj\s+J\s*Í\s*LEK/gi, 'Metoděj Jílek')
        .trim();

    return cleaned.split(/[\s-]+/)
        .filter(part => part.length > 0)
        .map(part => {
            if (VALID_COUNTRY_CODES.has(part)) return part;
            if (part.includes("'")) {
                return part.split("'").map(p =>
                    p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                ).join("'");
            }
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }).join(' ');
}

const inputs = [
    'Metoděj JÍLEK',
    'Metod ě j J Í LEK',
    'Metoděj J Í Lek',
    'Metoděj J Í LEK',
    'Metoděj Jílek',
    'JÍLEK'
];

inputs.forEach(input => {
    console.log(`"${input}" -> "${cleanName(input)}"`);
});
