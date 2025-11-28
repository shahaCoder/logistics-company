// Validation utilities with regex patterns

// Name validation: letters, spaces, hyphens, apostrophes (2-50 chars)
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s'-]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Email validation: standard email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

// US Phone validation: accepts various formats
// +1 (555) 123-4567, (555) 123-4567, 555-123-4567, 5551234567, etc.
export const validatePhone = (phone: string): boolean => {
  if (!phone || !phone.trim()) return false;
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  const digitsOnly = cleaned.replace(/\+/g, '');
  
  // Must have 10 or 11 digits (with country code)
  if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
    return false;
  }
  
  // Check format with regex (allows various formats)
  const phoneRegex = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone.trim());
};

// Company name validation: alphanumeric, spaces, common business chars (2-100 chars)
export const validateCompanyName = (name: string): boolean => {
  const companyRegex = /^[a-zA-Z0-9\s&.,'-]{2,100}$/;
  return companyRegex.test(name.trim());
};

// Address validation: alphanumeric, spaces, common address chars (5-200 chars)
export const validateAddress = (address: string): boolean => {
  const addressRegex = /^[a-zA-Z0-9\s,.#-]{5,200}$/;
  return addressRegex.test(address.trim());
};

// Message/Notes validation: allow most characters but limit length and prevent script tags
export const validateMessage = (message: string, minLength: number = 10, maxLength: number = 2000): boolean => {
  const trimmed = message.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength) {
    return false;
  }
  // Check for potential script injection
  const scriptRegex = /<script|javascript:|on\w+\s*=/i;
  return !scriptRegex.test(trimmed);
};

// Cargo description validation: alphanumeric, spaces, common chars (3-200 chars)
export const validateCargo = (cargo: string): boolean => {
  const cargoRegex = /^[a-zA-Z0-9\s,.-]{3,200}$/;
  return cargoRegex.test(cargo.trim());
};

// Weight validation: positive number (0-999999)
export const validateWeight = (weight: string): boolean => {
  if (!weight.trim()) return true; // Optional field
  const weightRegex = /^\d{1,6}$/;
  const num = parseInt(weight, 10);
  return weightRegex.test(weight.trim()) && num >= 0 && num <= 999999;
};

// Pallets validation: positive number or text like "24 pallets"
export const validatePallets = (pallets: string): boolean => {
  if (!pallets.trim()) return true; // Optional field
  const palletsRegex = /^(\d{1,4}|(\d{1,4}\s*(pallets?|pieces?|pcs?)))$/i;
  return palletsRegex.test(pallets.trim());
};

// Reference/PO number validation: alphanumeric, hyphens, underscores (1-50 chars)
export const validateReferenceId = (ref: string): boolean => {
  if (!ref.trim()) return true; // Optional field
  const refRegex = /^[a-zA-Z0-9_-]{1,50}$/;
  return refRegex.test(ref.trim());
};

// Date validation: check if date is not in the past (for pickup/delivery dates)
export const validateFutureDate = (dateString: string): boolean => {
  if (!dateString) return true; // Optional field
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

// Get validation error message
export const getValidationError = (field: string, value: string): string | null => {
  switch (field) {
    case 'name':
    case 'firstName':
    case 'lastName':
    case 'contactName':
      if (!validateName(value)) {
        return 'Please enter a valid name (2-50 characters, letters only)';
      }
      break;
    case 'email':
      if (!validateEmail(value)) {
        return 'Please enter a valid email address';
      }
      break;
    case 'phone':
      if (!validatePhone(value)) {
        return 'Please enter a valid US phone number (e.g., +1 (555) 123-4567)';
      }
      break;
    case 'companyName':
      if (!validateCompanyName(value)) {
        return 'Please enter a valid company name (2-100 characters)';
      }
      break;
    case 'message':
      if (!validateMessage(value)) {
        return 'Message must be between 10 and 2000 characters';
      }
      break;
    case 'cargo':
      if (!validateCargo(value)) {
        return 'Please enter a valid cargo description (3-200 characters)';
      }
      break;
    case 'weight':
      if (!validateWeight(value)) {
        return 'Please enter a valid weight (0-999999 lbs)';
      }
      break;
    case 'pallets':
      if (!validatePallets(value)) {
        return 'Please enter a valid number (e.g., 24 or "24 pallets")';
      }
      break;
    case 'pickupAddress':
    case 'deliveryAddress':
      if (!validateAddress(value)) {
        return 'Please enter a valid address (5-200 characters)';
      }
      break;
    case 'referenceId':
      if (!validateReferenceId(value)) {
        return 'Please enter a valid reference/PO number (alphanumeric, hyphens, underscores)';
      }
      break;
  }
  return null;
};

