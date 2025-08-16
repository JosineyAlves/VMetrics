// Teste da lógica de agrupamento por source_title
// Simula os dados que vêm da API do RedTrack

const testData = {
  "campaigns": [
    {
      "id": "688187ef41332f6562846fa9",
      "title": "Taboola - Prozetith",
      "source_title": "Taboola",
      "status": "active",
      "stat": {
        "cost": 399.9,
        "clicks": 573,
        "conversions": 0
      }
    },
    {
      "id": "687f060db92e32dd00ea83bd",
      "title": "Facebook - Morango Lucrativo",
      "source_title": "Facebook",
      "status": "active",
      "stat": {
        "cost": 191.25,
        "clicks": 137,
        "conversions": 9
      }
    },
    {
      "id": "687f029939180ad2db89cdb7",
      "title": "Facebook - Morango Lucrativo - Teste",
      "source_title": "Facebook",
      "status": "active",
      "stat": {
        "cost": 0,
        "clicks": 2,
        "conversions": 1
      }
    }
  ]
};

// Função de teste da lógica de agrupamento
function testSourceGrouping() {
  console.log('🧪 TESTE: Agrupamento por source_title');
  console.log('=' .repeat(50));
  
  // Simular a lógica do Dashboard
  const sourceGroups = {};
  const campaigns = testData.campaigns;
  
  console.log(`📊 Processando ${campaigns.length} campanhas...\n`);
  
  campaigns.forEach((campaign, index) => {
    const sourceTitle = campaign.source_title || campaign.source || 'Indefinido';
    const cost = campaign.stat?.cost || campaign.cost || 0;
    
    console.log(`🔍 Campanha ${index + 1}: ${campaign.title}`);
    console.log(`   - source_title: "${sourceTitle}"`);
    console.log(`   - cost: ${cost}`);
    console.log(`   - stat.cost: ${campaign.stat?.cost}`);
    
    if (cost > 0) {
      if (!sourceGroups[sourceTitle]) {
        sourceGroups[sourceTitle] = 0;
      }
      sourceGroups[sourceTitle] += cost;
      console.log(`   ✅ Adicionado: ${sourceTitle} = ${sourceGroups[sourceTitle]}`);
    } else {
      console.log(`   ⚠️ Campanha sem custo`);
    }
    console.log('');
  });
  
  console.log('📊 RESULTADO DO AGRUPAMENTO:');
  console.log('=' .repeat(30));
  
  if (Object.keys(sourceGroups).length === 0) {
    console.log('❌ Nenhuma fonte com custo encontrada!');
    return;
  }
  
  // Converter para formato do gráfico
  const mapped = Object.entries(sourceGroups).map(([sourceName, totalCost]) => ({
    key: sourceName,
    cost: totalCost,
  }));
  
  const sortedData = mapped.sort((a, b) => b.cost - a.cost);
  
  console.log('📈 DADOS PARA O GRÁFICO:');
  sortedData.forEach((item, index) => {
    console.log(`${index + 1}. ${item.key}: R$ ${item.cost.toFixed(2)}`);
  });
  
  const totalInvestido = sortedData.reduce((sum, item) => sum + item.cost, 0);
  console.log(`\n💰 TOTAL INVESTIDO: R$ ${totalInvestido.toFixed(2)}`);
  console.log(`📊 TOTAL DE FONTES: ${sortedData.length}`);
  
  // Verificar se o resultado está correto
  console.log('\n✅ VERIFICAÇÃO:');
  const expectedTaboola = 399.9;
  const expectedFacebook = 191.25;
  const expectedTotal = 591.15;
  
  const actualTaboola = sourceGroups['Taboola'] || 0;
  const actualFacebook = sourceGroups['Facebook'] || 0;
  const actualTotal = totalInvestido;
  
  console.log(`Taboola: Esperado R$ ${expectedTaboola}, Obtido R$ ${actualTaboola} - ${actualTaboola === expectedTaboola ? '✅' : '❌'}`);
  console.log(`Facebook: Esperado R$ ${expectedFacebook}, Obtido R$ ${actualFacebook} - ${actualFacebook === expectedFacebook ? '✅' : '❌'}`);
  console.log(`Total: Esperado R$ ${expectedTotal}, Obtido R$ ${actualTotal} - ${actualTotal === expectedTotal ? '✅' : '❌'}`);
  
  // Verificar se não há "Indefinido"
  const hasUndefined = sourceGroups['Indefinido'] !== undefined;
  console.log(`Sem "Indefinido": ${!hasUndefined ? '✅' : '❌'}`);
  
  return {
    success: actualTaboola === expectedTaboola && 
             actualFacebook === expectedFacebook && 
             actualTotal === expectedTotal && 
             !hasUndefined,
    sourceGroups,
    sortedData,
    totalInvestido
  };
}

// Executar o teste
console.log('🚀 Iniciando teste de agrupamento por source_title...\n');
const result = testSourceGrouping();

console.log('\n' + '=' .repeat(50));
if (result.success) {
  console.log('🎉 TESTE PASSOU! A lógica está funcionando corretamente.');
} else {
  console.log('❌ TESTE FALHOU! Há problemas na lógica de agrupamento.');
}
console.log('=' .repeat(50));
