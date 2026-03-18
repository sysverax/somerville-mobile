/**
 * Formats a date string into a readable format
 * @param dateString - Date string in ISO format or YYYY-MM-DD format
 * @returns Formatted date string (e.g., "Feb 8, 2026, 10:30 AM")
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
};

/**
 * Formats a date string into a date-only format
 * @param dateString - Date string in ISO format or YYYY-MM-DD format
 * @returns Formatted date string (e.g., "Feb 8, 2026")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
};

/**
 * Formats a time string into a readable format
 * @param timeString - Time string in HH:MM format
 * @returns Formatted time string (e.g., "10:30 AM")
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return 'N/A';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return timeString; // Return original if parsing fails
  }
};
