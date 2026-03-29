import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export interface IExcelValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface IExcelProcessResult<T> {
  success: boolean;
  data: T[];
  errors: IExcelValidationError[];
  totalRows: number;
  validRows: number;
}

export default class ExcelUtility {
  /**
   * Parse Excel file and convert to JSON
   */
  static parseExcelFile<T>(filePath: string, sheetName?: string): T[] {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      
      // Get sheet name (first sheet if not specified)
      const sheet = sheetName || workbook.SheetNames[0];
      
      if (!workbook.Sheets[sheet]) {
        throw new Error(`Sheet '${sheet}' not found in Excel file`);
      }
      
      // Convert sheet to JSON with better options
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
        header: 1, // Use first row as headers
        defval: '', // Default value for empty cells
        blankrows: false, // Skip blank rows
        raw: false // Convert dates and numbers to strings for consistency
      });
      
      if (jsonData.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }
      
      // Get headers from first row
      const headers = jsonData[0] as string[];
      
      // Convert rows to objects, filtering out completely empty rows
      const result: T[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        
        // Skip completely empty rows
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
          continue;
        }
        
        const obj: any = {};
        let hasData = false;
        
        headers.forEach((header, index) => {
          // Clean header name (remove spaces, convert to snake_case)
          const cleanHeader = header.trim().toLowerCase().replace(/\s+/g, '_');
          const cellValue = row[index] || '';
          obj[cleanHeader] = cellValue;
          
          // Check if this row has any meaningful data
          if (cellValue && cellValue.toString().trim() !== '') {
            hasData = true;
          }
        });
        
        // Only add rows that have at least some data
        if (hasData) {
          result.push(obj as T);
        }
      }
      
      console.log(`📊 Parsed Excel file: ${result.length} data rows found (excluding ${jsonData.length - 1 - result.length} empty rows)`);
      
      return result;
      
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }
  
  /**
   * Validate Excel data structure
   */
  static validateExcelStructure(
    data: any[], 
    requiredFields: string[]
  ): IExcelValidationError[] {
    const errors: IExcelValidationError[] = [];
    
    if (!data || data.length === 0) {
      errors.push({
        row: 0,
        field: 'file',
        message: 'Excel file is empty or contains no valid data'
      });
      return errors;
    }
    
    // Check if all required fields exist in the first row
    const firstRow = data[0];
    const availableFields = Object.keys(firstRow);
    
    requiredFields.forEach(field => {
      if (!availableFields.includes(field)) {
        errors.push({
          row: 0,
          field: field,
          message: `Required column '${field}' is missing from Excel file`
        });
      }
    });
    
    return errors;
  }
  
  /**
   * Clean up temporary file
   */
  static cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to cleanup file ${filePath}:`, error);
    }
  }
  
  /**
   * Generate Excel template for download with enhanced formatting
   */
  static generateTemplate(headers: string[], sampleData?: any[]): Buffer {
    // Create worksheet with headers
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    
    // Add sample data if provided
    if (sampleData && sampleData.length > 0) {
      const sampleRows = sampleData.map(item => 
        headers.map(header => item[header] || '')
      );
      XLSX.utils.sheet_add_aoa(ws, sampleRows, { origin: 'A2' });
    }
    
    // Set column widths for better readability
    const colWidths = headers.map(header => {
      switch (header) {
        case 'first_name':
        case 'last_name':
        case 'gender':
          return { wch: 15 };
        case 'email':
        case 'login_user_id':
          return { wch: 25 };
        case 'mobile_number':
        case 'alternate_contact':
          return { wch: 15 };
        case 'date_of_birth':
        case 'wwc_expiry_date':
        case 'police_check_expiry_date':
          return { wch: 12 };
        case 'trainer_type':
        case 'available_days':
        case 'time_slots':
          return { wch: 20 };
        case 'course_auth':
          return { wch: 40 };
        case 'state_covered':
        case 'cities_covered':
          return { wch: 18 };
        case 'acc_numbers':
        case 'police_check_number':
          return { wch: 15 };
        case 'yoe':
        case 'wwchildcheck':
        case 'suprise_visit':
          return { wch: 10 };
        case 'login_password':
          return { wch: 20 };
        default:
          return { wch: 15 };
      }
    });
    
    ws['!cols'] = colWidths;
    
    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trainers');
    
    // Add instructions sheet
    const instructionsData = [
      ['BULK TRAINER UPLOAD INSTRUCTIONS'],
      [''],
      ['Required Fields (must have values):'],
      ['• first_name - Trainer\'s first name'],
      ['• last_name - Trainer\'s last name'],
      ['• gender - Male, Female, or Other'],
      ['• date_of_birth - Format: YYYY-MM-DD (e.g., 1990-01-15)'],
      ['• mobile_number - 10-15 digits (e.g., 0912345678)'],
      ['• email - Valid email address (must be unique)'],
      ['• login_user_id - Unique login ID (must be unique)'],
      ['• login_password - Strong password for login'],
      [''],
      ['Optional Fields:'],
      ['• alternate_contact - Alternative phone number'],
      ['• trainer_type - Comma-separated (e.g., Full-time,Part-time)'],
      ['• course_auth - Comma-separated course authorizations'],
      ['• acc_numbers - Accreditation numbers'],
      ['• yoe - Years of experience (number)'],
      ['• state_covered - Comma-separated states (e.g., NSW,VIC)'],
      ['• cities_covered - Comma-separated cities (e.g., Sydney,Melbourne)'],
      ['• available_days - Comma-separated days (e.g., Monday,Tuesday)'],
      ['• time_slots - Comma-separated time ranges (e.g., 09:00-12:00,14:00-17:00)'],
      ['• suprise_visit - "yes"/"no" or "1"/"0" (converted to 1=yes, 0=no)'],
      ['• wwchildcheck - 0=Pending, 1=Approved, 2=Expired'],
      ['• wwc_expiry_date - Format: YYYY-MM-DD'],
      ['• police_check_number - Police check reference'],
      ['• police_check_expiry_date - Format: YYYY-MM-DD'],
      [''],
      ['Important Notes:'],
      ['• Email addresses must be unique across the system'],
      ['• Login IDs must be unique across the system'],
      ['• Use comma separation for multiple values (no spaces after commas)'],
      ['• Date format must be YYYY-MM-DD'],
      ['• Empty cells are treated as null/undefined'],
      ['• The system will validate each row and report errors'],
      ['• Successfully processed rows will create trainer accounts'],
      ['• Failed rows will be reported with specific error messages']
    ];
    
    const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsWs['!cols'] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');
    
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}