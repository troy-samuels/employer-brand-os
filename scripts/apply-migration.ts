import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../frontend/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

async function applyMigration() {
  console.log('🔄 Applying migration via Supabase SQL API\n');
  
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250218000000_create_contacts_system.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  
  try {
    // Use Supabase's direct SQL execution endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ 
        query: sql 
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Migration failed:', response.status, errorText);
      
      // Try alternative: use pg_admin SQL editor simulation
      console.log('\n⚙️  Attempting alternative method via SQL editor API...\n');
      
      const editorResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ 
          query: sql
        })
      });
      
      if (!editorResponse.ok) {
        const editorError = await editorResponse.text();
        console.error('❌ Alternative method also failed:', editorResponse.status, editorError);
        console.log('\n📝 Please run this SQL manually in the Supabase SQL editor:');
        console.log('   https://supabase.com/dashboard/project/gkjhglqaodxzcqbccybc/sql/new\n');
        console.log('Migration SQL saved at:', migrationPath);
        process.exit(1);
      }
    }
    
    console.log('✅ Migration applied successfully!\n');
    
  } catch (err: any) {
    console.error('❌ Error applying migration:', err.message || err);
    console.log('\n📝 Please run this SQL manually in the Supabase SQL editor:');
    console.log('   https://supabase.com/dashboard/project/gkjhglqaodxzcqbccybc/sql/new\n');
    console.log('Migration SQL saved at:', migrationPath);
    process.exit(1);
  }
}

applyMigration();
