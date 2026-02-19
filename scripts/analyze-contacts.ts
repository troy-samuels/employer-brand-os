import fs from 'fs';
import readline from 'readline';
import path from 'path';

interface ContactRow {
  salutation: string;
  firstName: string;
  lastName: string;
  title: string;
  accountName: string;
  mailingStreet: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  mailingCountry: string;
  phone: string;
  fax: string;
  mobile: string;
  email: string;
  accountOwner: string;
}

interface AnalysisStats {
  totalRows: number;
  countries: Map<string, number>;
  uniqueEmails: Set<string>;
  uniqueCompanies: Set<string>;
  blankEmails: number;
  blankCompanies: number;
  blankTitles: number;
  invalidEmails: number;
  duplicateEmails: Set<string>;
  seenEmails: Set<string>;
  titles: Map<string, number>;
  seniorityDistribution: {
    executive: number;        // C-level, VP, SVP, EVP
    director: number;          // Director, Head of
    manager: number;           // Manager, Lead
    specialist: number;        // Specialist, Analyst, Coordinator
    other: number;
  };
  departmentDistribution: {
    hr: number;
    recruiting: number;
    talent: number;
    people: number;
    other: number;
  };
  ukContacts: number;
  usContacts: number;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result;
}

function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function categorizeSeniority(title: string): keyof AnalysisStats['seniorityDistribution'] {
  const titleLower = title.toLowerCase();
  
  // Executive level
  if (/(^|\s)(ceo|cfo|cto|coo|chief|president|vp|vice president|svp|evp|c-level)/i.test(titleLower)) {
    return 'executive';
  }
  
  // Director level
  if (/(^|\s)(director|head of|associate director)/i.test(titleLower)) {
    return 'director';
  }
  
  // Manager level
  if (/(^|\s)(manager|lead|supervisor|team lead)/i.test(titleLower)) {
    return 'manager';
  }
  
  // Specialist level
  if (/(^|\s)(specialist|analyst|coordinator|associate|assistant|officer|representative)/i.test(titleLower)) {
    return 'specialist';
  }
  
  return 'other';
}

function categorizeDepartment(title: string): keyof AnalysisStats['departmentDistribution'] {
  const titleLower = title.toLowerCase();
  
  if (/\b(hr|human resources)\b/i.test(titleLower)) {
    return 'hr';
  }
  
  if (/\b(recruit|talent acquisition|ta)\b/i.test(titleLower)) {
    return 'recruiting';
  }
  
  if (/\b(talent)\b/i.test(titleLower)) {
    return 'talent';
  }
  
  if (/\b(people|culture)\b/i.test(titleLower)) {
    return 'people';
  }
  
  return 'other';
}

async function analyzeContacts(filePath: string, sampleSize: number = 50000): Promise<void> {
  console.log('🔍 Starting contact database analysis...\n');
  console.log(`📊 Sampling first ${sampleSize.toLocaleString()} rows for detailed analysis`);
  console.log(`📈 Counting all rows for total statistics\n`);
  
  const stats: AnalysisStats = {
    totalRows: 0,
    countries: new Map(),
    uniqueEmails: new Set(),
    uniqueCompanies: new Set(),
    blankEmails: 0,
    blankCompanies: 0,
    blankTitles: 0,
    invalidEmails: 0,
    duplicateEmails: new Set(),
    seenEmails: new Set(),
    titles: new Map(),
    seniorityDistribution: {
      executive: 0,
      director: 0,
      manager: 0,
      specialist: 0,
      other: 0,
    },
    departmentDistribution: {
      hr: 0,
      recruiting: 0,
      talent: 0,
      people: 0,
      other: 0,
    },
    ukContacts: 0,
    usContacts: 0,
  };

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let isFirstLine = true;
  let headers: string[] = [];

  for await (const line of rl) {
    if (isFirstLine) {
      headers = parseCSVLine(line);
      isFirstLine = false;
      continue;
    }

    stats.totalRows++;

    // Only do detailed analysis on sample
    if (stats.totalRows <= sampleSize) {
      const values = parseCSVLine(line);
      
      if (values.length !== headers.length) {
        console.warn(`⚠️  Row ${stats.totalRows}: Column count mismatch`);
        continue;
      }

      const row: ContactRow = {
        salutation: values[0] || '',
        firstName: values[1] || '',
        lastName: values[2] || '',
        title: values[3] || '',
        accountName: values[4] || '',
        mailingStreet: values[5] || '',
        mailingCity: values[6] || '',
        mailingState: values[7] || '',
        mailingZip: values[8] || '',
        mailingCountry: values[9] || '',
        phone: values[10] || '',
        fax: values[11] || '',
        mobile: values[12] || '',
        email: values[13] || '',
        accountOwner: values[14] || '',
      };

      // Email analysis
      const emailTrimmed = row.email.trim();
      if (!emailTrimmed) {
        stats.blankEmails++;
      } else if (!isValidEmail(emailTrimmed)) {
        stats.invalidEmails++;
      } else {
        if (stats.seenEmails.has(emailTrimmed.toLowerCase())) {
          stats.duplicateEmails.add(emailTrimmed.toLowerCase());
        } else {
          stats.seenEmails.add(emailTrimmed.toLowerCase());
          stats.uniqueEmails.add(emailTrimmed.toLowerCase());
        }
      }

      // Company analysis
      const companyTrimmed = row.accountName.trim();
      if (!companyTrimmed) {
        stats.blankCompanies++;
      } else {
        stats.uniqueCompanies.add(companyTrimmed);
      }

      // Title analysis
      const titleTrimmed = row.title.trim();
      if (!titleTrimmed) {
        stats.blankTitles++;
      } else {
        stats.titles.set(titleTrimmed, (stats.titles.get(titleTrimmed) || 0) + 1);
        
        // Seniority
        const seniority = categorizeSeniority(titleTrimmed);
        stats.seniorityDistribution[seniority]++;
        
        // Department
        const department = categorizeDepartment(titleTrimmed);
        stats.departmentDistribution[department]++;
      }

      // Country analysis
      const countryTrimmed = row.mailingCountry.trim();
      if (countryTrimmed) {
        stats.countries.set(countryTrimmed, (stats.countries.get(countryTrimmed) || 0) + 1);
        
        if (countryTrimmed.toUpperCase() === 'UK') {
          stats.ukContacts++;
        } else if (countryTrimmed.toUpperCase() === 'US') {
          stats.usContacts++;
        }
      }
    }

    // Progress indicator for all rows
    if (stats.totalRows % 100000 === 0) {
      console.log(`   Processed ${(stats.totalRows / 1000000).toFixed(2)}M rows...`);
    }
  }

  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('📊 CONTACT DATABASE ANALYSIS REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n📈 OVERALL STATISTICS`);
  console.log(`   Total contacts: ${stats.totalRows.toLocaleString()}`);
  console.log(`   Unique emails (sample): ${stats.uniqueEmails.size.toLocaleString()}`);
  console.log(`   Unique companies (sample): ${stats.uniqueCompanies.size.toLocaleString()}`);
  
  console.log(`\n⚠️  DATA QUALITY ISSUES (in first ${sampleSize.toLocaleString()} rows)`);
  console.log(`   Blank emails: ${stats.blankEmails.toLocaleString()} (${(stats.blankEmails / sampleSize * 100).toFixed(2)}%)`);
  console.log(`   Invalid emails: ${stats.invalidEmails.toLocaleString()} (${(stats.invalidEmails / sampleSize * 100).toFixed(2)}%)`);
  console.log(`   Duplicate emails: ${stats.duplicateEmails.size.toLocaleString()}`);
  console.log(`   Blank companies: ${stats.blankCompanies.toLocaleString()} (${(stats.blankCompanies / sampleSize * 100).toFixed(2)}%)`);
  console.log(`   Blank titles: ${stats.blankTitles.toLocaleString()} (${(stats.blankTitles / sampleSize * 100).toFixed(2)}%)`);
  
  console.log(`\n🌍 TOP 15 COUNTRIES`);
  const sortedCountries = Array.from(stats.countries.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  
  sortedCountries.forEach(([country, count]) => {
    const percentage = (count / sampleSize * 100).toFixed(2);
    console.log(`   ${country.padEnd(25)} ${count.toLocaleString().padStart(8)} (${percentage}%)`);
  });
  
  console.log(`\n🎯 SENIORITY DISTRIBUTION`);
  Object.entries(stats.seniorityDistribution).forEach(([level, count]) => {
    const percentage = (count / sampleSize * 100).toFixed(2);
    console.log(`   ${level.padEnd(20)} ${count.toLocaleString().padStart(8)} (${percentage}%)`);
  });
  
  console.log(`\n🏢 DEPARTMENT DISTRIBUTION`);
  Object.entries(stats.departmentDistribution).forEach(([dept, count]) => {
    const percentage = (count / sampleSize * 100).toFixed(2);
    console.log(`   ${dept.padEnd(20)} ${count.toLocaleString().padStart(8)} (${percentage}%)`);
  });
  
  console.log(`\n📋 TOP 30 JOB TITLES`);
  const sortedTitles = Array.from(stats.titles.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);
  
  sortedTitles.forEach(([title, count]) => {
    const seniority = categorizeSeniority(title);
    const seniorityBadge = 
      seniority === 'executive' ? '👔' :
      seniority === 'director' ? '🎯' :
      seniority === 'manager' ? '📊' :
      seniority === 'specialist' ? '🔧' : '❓';
    console.log(`   ${seniorityBadge} ${title.slice(0, 60).padEnd(62)} ${count.toLocaleString().padStart(6)}`);
  });
  
  console.log(`\n🎯 PRIORITY SEGMENT SIZING (based on sample)`);
  console.log(`   UK contacts: ${stats.ukContacts.toLocaleString()} (${(stats.ukContacts / sampleSize * 100).toFixed(2)}%)`);
  console.log(`   US contacts: ${stats.usContacts.toLocaleString()} (${(stats.usContacts / sampleSize * 100).toFixed(2)}%)`);
  console.log(`   Executive + Director: ${(stats.seniorityDistribution.executive + stats.seniorityDistribution.director).toLocaleString()} (${((stats.seniorityDistribution.executive + stats.seniorityDistribution.director) / sampleSize * 100).toFixed(2)}%)`);
  console.log(`   HR + Recruiting + Talent: ${(stats.departmentDistribution.hr + stats.departmentDistribution.recruiting + stats.departmentDistribution.talent).toLocaleString()} (${((stats.departmentDistribution.hr + stats.departmentDistribution.recruiting + stats.departmentDistribution.talent) / sampleSize * 100).toFixed(2)}%)`);
  
  // Extrapolate to full database
  const ukProjection = Math.round((stats.ukContacts / sampleSize) * stats.totalRows);
  const decisionMakerProjection = Math.round(((stats.seniorityDistribution.executive + stats.seniorityDistribution.director) / sampleSize) * stats.totalRows);
  
  console.log(`\n🚀 FULL DATABASE PROJECTIONS (extrapolated from sample)`);
  console.log(`   UK contacts (estimated): ${ukProjection.toLocaleString()}`);
  console.log(`   Decision makers (estimated): ${decisionMakerProjection.toLocaleString()}`);
  console.log(`   UK Decision makers (estimated): ${Math.round(ukProjection * ((stats.seniorityDistribution.executive + stats.seniorityDistribution.director) / sampleSize)).toLocaleString()}`);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Analysis complete!\n');
}

// Run analysis
const csvPath = path.join(process.env.HOME!, 'Downloads', 'report1754063479110.csv');
analyzeContacts(csvPath, 50000).catch(console.error);
