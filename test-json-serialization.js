// Teste de serialização JSON para verificar se convtype1 está sendo removido
const testObject = {
  clicks: 122,
  unique_clicks: 120,
  conversions: 7,
  all_conversions: 7,
  approved: 7,
  pending: 0,
  declined: 0,
  revenue: 179.3,
  cost: 151.45,
  impressions: 0,
  ctr: 0,
  conversion_rate: 0,
  convtype1: 0
};

console.log('🔍 Teste de serialização JSON:');
console.log('Objeto original:', testObject);
console.log('convtype1 no objeto:', testObject.convtype1);
console.log('typeof convtype1:', typeof testObject.convtype1);
console.log('hasOwnProperty convtype1:', testObject.hasOwnProperty('convtype1'));

const jsonString = JSON.stringify(testObject, null, 2);
console.log('\nJSON serializado:');
console.log(jsonString);

const parsedObject = JSON.parse(jsonString);
console.log('\nObjeto após parse:');
console.log('convtype1 após parse:', parsedObject.convtype1);
console.log('hasOwnProperty convtype1 após parse:', parsedObject.hasOwnProperty('convtype1')); 