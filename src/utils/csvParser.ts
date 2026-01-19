import { Vocabulary } from '@/types/types';

export function parseCSV(csvText: string): Vocabulary[] {
  const lines = csvText.trim().split('\n');
  const vocabularies: Vocabulary[] = [];
  
  // Skip header if present
  const startIndex = lines[0]?.toLowerCase().includes('word') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV with proper quote handling
    const values = parseCSVLine(line);
    
    if (values.length >= 4) {
      vocabularies.push({
        word: values[0].trim(),
        meaning: values[1].trim(),
        germanExample: values[2].trim(),
        memoryTip: values[3].trim(),
      });
    }
  }
  
  return vocabularies;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

export const sampleData = `Word,Meaning,German Example,Memory Tip
obwohl,although/even though,"Ich gehe spazieren, obwohl es regnet.","Think 'Oh-well'. Even though it rains, oh well, I'm going out."
trotzdem,nevertheless/anyway,"Es regnet, trotzdem gehe ich spazieren.","Sounds like 'Trust them'. Even if you don't trust them, do it anyway."
entscheiden,to decide,"Ich kann mich nicht entscheiden.","'En-TIDY-en'. To decide is to tidy up your mess of options."
sich beschweren,to complain,"Er beschwert sich über das Essen.","'Be-swearing'. When you complain, you might feel like swearing."`;
