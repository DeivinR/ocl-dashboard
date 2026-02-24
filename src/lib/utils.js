export const THEME = { primary: '#003366', secondary: '#004990', accent: '#F59E0B', bg: '#F1F5F9', card: '#FFFFFF', text: '#1E293B', success: '#10B981', danger: '#EF4444' };

export const parseCurrency = (valStr) => {
    if (!valStr) return 0;
    if (typeof valStr === 'number') return valStr;
    let clean = valStr.toString().replaceAll(/[R$\s]/g, '').trim();
    if (clean.includes(',') && clean.includes('.')) { clean = clean.replaceAll('.', '').replaceAll(',', '.'); } 
    else if (clean.includes(',')) { clean = clean.replaceAll(',', '.'); }
    return Number.parseFloat(clean) || 0;
};

export const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
export const formatNumber = (val) => new Intl.NumberFormat('pt-BR').format(Math.round(val));
export const formatMonth = (str) => { 
    if (!str) return "-"; 
    const [y, m] = str.split('-'); 
    return new Date(y, m - 1).toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase(); 
};
