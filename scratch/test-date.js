const now = new Date('2026-05-13T22:00:00Z');
const dateStr = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(now);
console.log('UTC:', now.toISOString());
console.log('DateStr (Seoul):', dateStr);
