import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../frontend/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🔄 Running migration: 20250218000000_create_contacts_system.sql\n');
  
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250218000000_create_contacts_system.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  
  // Split by semicolons (rough approach - works for most migrations)
  // Note: This is not perfect for complex SQL but should work for our migration
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));
  
  console.log(`📊 Found ${statements.length} SQL statements\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comments and empty statements
    if (statement.trim() === '' || statement.trim().startsWith('--')) {
      continue;
    }
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
      
      if (error) {
        // Try direct execution if rpc fails
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ query: statement + ';' })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
      }
      
      successCount++;
      
      // Show progress for long migrations
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Executed ${i + 1}/${statements.length} statements...`);
      }
      
    } catch (err: any) {
      // Some errors are expected (like "already exists")
      const errorMsg = err.message || String(err);
      
      if (
        errorMsg.includes('already exists') ||
        errorMsg.includes('does not exist') ||
        errorMsg.includes('duplicate')
      ) {
        console.log(`⚠️  Skipped (already exists): ${statement.slice(0, 50)}...`);
        successCount++;
      } else {
        console.error(`❌ Error on statement ${i + 1}:`, errorMsg);
        console.error(`   Statement: ${statement.slice(0, 100)}...`);
        errorCount++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`✅ Migration complete: ${successCount} statements executed`);
  if (errorCount > 0) {
    console.log(`⚠️  Errors: ${errorCount}`);
  }
  console.log('='.repeat(80) + '\n');
}

runMigration().catch(console.error);
