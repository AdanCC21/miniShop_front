export function getDate(date: Date | string): string {
    let base = new Date();
    if(typeof date === 'string'){
        base = new Date(date);
    }
    if (Number.isNaN(base.getTime())) return '';

    return base.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    });
}