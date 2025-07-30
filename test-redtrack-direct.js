async function testRedTrackDirect() {
  console.log('🔍 Testando RedTrack API diretamente para verificar convtype1...');
  
  try {
    const apiKey = 'K0Y6dcsgEqmjQp0CKD49';
    const dateFrom = '2025-07-01';
    const dateTo = '2025-07-31';
    
    // Testar endpoint /report com group_by=campaign
    const reportUrl = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&group_by=campaign&per=1000`;
    
    console.log('📡 Testando /report com group_by=campaign:', reportUrl);
    
    const reportResponse = await fetch(reportUrl);
    const reportData = await reportResponse.json();
    
    console.log('\n📊 Resposta do /report:');
    console.log(JSON.stringify(reportData, null, 2));
    
    // Testar endpoint /campaigns
    const campaignsUrl = `https://api.redtrack.io/campaigns?api_key=${apiKey}&per=1000`;
    
    console.log('\n📡 Testando /campaigns:', campaignsUrl);
    
    const campaignsResponse = await fetch(campaignsUrl);
    const campaignsData = await campaignsResponse.json();
    
    console.log('\n📊 Resposta do /campaigns:');
    console.log(JSON.stringify(campaignsData, null, 2));
    
    // Testar endpoint /report para uma campanha específica
    if (campaignsData && campaignsData.length > 0) {
      const firstCampaign = campaignsData[0];
      const campaignReportUrl = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&campaign_id=${firstCampaign.id}&per=1000`;
      
      console.log(`\n📡 Testando /report para campanha específica ${firstCampaign.id}:`, campaignReportUrl);
      
      const campaignReportResponse = await fetch(campaignReportUrl);
      const campaignReportData = await campaignReportResponse.json();
      
      console.log('\n📊 Resposta do /report para campanha específica:');
      console.log(JSON.stringify(campaignReportData, null, 2));
      
      // Verificar se convtype1 está presente nos dados diários
      if (Array.isArray(campaignReportData)) {
        console.log('\n🔍 Análise de convtype1 nos dados diários:');
        campaignReportData.forEach((dayData, index) => {
          console.log(`Dia ${index + 1}: convtype1 = ${dayData.convtype1}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testRedTrackDirect(); 