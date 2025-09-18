const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

async function validateSchemas() {
  console.log('🔍 Validating JSON schemas...\n');
  
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  
  const schemaDir = path.join(__dirname, '../../api-contracts/schemas');
  const schemaFiles = [
    'state.json',
    'operators.json', 
    'nearest-legal.json'
  ];
  
  let allValid = true;
  
  for (const schemaFile of schemaFiles) {
    try {
      const schemaPath = path.join(schemaDir, schemaFile);
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);
      
      // Validate the schema itself
      const validate = ajv.compile(schema);
      
      if (validate.errors) {
        console.error(`❌ ${schemaFile} has validation errors:`);
        validate.errors.forEach(error => {
          console.error(`   - ${error.message}`);
        });
        allValid = false;
      } else {
        console.log(`✅ ${schemaFile} is valid`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${schemaFile}:`, error.message);
      allValid = false;
    }
  }
  
  if (allValid) {
    console.log('\n🎉 All schemas are valid!');
    process.exit(0);
  } else {
    console.log('\n💥 Schema validation failed!');
    process.exit(1);
  }
}

validateSchemas().catch(console.error);
