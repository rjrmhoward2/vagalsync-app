const BiologicalWindowsOptimizer = require('./lib/optimizer');

async function test() {
  console.log('🧪 Testing Biological Windows Optimizer...\n');
  
  const optimizer = new BiologicalWindowsOptimizer();
  
  const profile = await optimizer.createBiologicalProfile('test-user', {
    chronotype: 'early',
    profession: 'wellness'
  });
  
  console.log('✅ Profile created!');
  console.log('Chronotype:', profile.chronotype);
  console.log('Profession:', profile.profession);
  
  const windows = await optimizer.getOptimalWindows(
    profile, 
    'protocolUse', 
    new Date(), 
    60
  );
  
  console.log('\n🎯 Top 3 Optimal Windows:\n');
  windows.slice(0, 3).forEach((w, i) => {
    console.log(`${i + 1}. ${w.startTime} - ${w.endTime}`);
    console.log(`   Effectiveness: ${w.effectiveness}x`);
    console.log(`   Confidence: ${w.confidence}\n`);
  });
}

test().catch(err => {
  console.error('❌ Error:', err.message);
});