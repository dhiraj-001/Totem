import React, { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, User, MessageSquare, RefreshCw } from 'lucide-react';

// Google Sheets API configuration
const GOOGLE_SHEETS_API_KEY = 'AIzaSyBD8ieWMpe7CgM2Nn5CjwSsF2fbVdAsSTk';
const SPREADSHEET_ID = '1gVKtmXIFtsiiaV2XAlUSSAHgpMQ0_jQqxzvs_Z8BQRo';
const SHEET_NAME = 'Sheet1'; // You can change this to your specific sheet name

interface ChatMessage {
  role: 'bot' | 'user';
  content: string;
  timestamp: string;
}

interface ConversationContext {
  messages: ChatMessage[];
  variables: {
    page: string;
    referrer: string;
    userAgent: string;
  };
}

interface Contact {
  id: string;
  chatbotId: string;
  userId: number;
  name: string;
  phone: string;
  email: string;
  consentGiven: boolean;
  conversationContext: ConversationContext;
  createdAt: string;
  updatedAt?: string;
}


// Google Sheets data interface

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dataSource, setDataSource] = useState<'sheets' | 'api'>('api');

  // Function to fetch data from Google Sheets
  const fetchFromGoogleSheets = async (): Promise<Contact[]> => {
    try {
      const range = `${SHEET_NAME}!A:G`; // Assuming columns A-G contain the data
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from Google Sheets: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.values || data.values.length === 0) {
        console.log('No data found in Google Sheets');
        return [];
      }
      
      // Skip the header row and process data
      const rows = data.values.slice(1);
      
      return rows.map((row: any[], index: number) => {
        // Handle different column arrangements - try to map columns intelligently
        // Ensure we have enough columns, pad with empty strings if needed
        const paddedRow = [...row, '', '', '', '', '', ''];
        
        // Try to intelligently map columns based on content
        let name = '', email = '', phone = '', conversationData = '', source = '', timestamp = '';
        
        // Look for email pattern
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Look for phone pattern (basic)
        const phonePattern = /^[\+]?[0-9\s\-\(\)]+$/;
        // Look for ID pattern (just numbers)
        const idPattern = /^\d+$/;
        
        // First pass: identify emails, phones, and timestamps
        paddedRow.forEach((cell) => {
          if (cell) {
            const cellStr = String(cell).trim();
            
            // Check if it's an email
            if (emailPattern.test(cellStr) && !email) {
              email = cellStr;
            }
            // Check if it's a phone number
            else if (phonePattern.test(cellStr) && cellStr.length >= 7 && !phone) {
              phone = cellStr;
            }
            // Check if it's a date/timestamp
            else if (new Date(cellStr).toString() !== 'Invalid Date' && !timestamp) {
              timestamp = cellStr;
            }
          }
        });
        
        // Second pass: identify names (skip IDs and already identified fields)
        paddedRow.forEach((cell) => {
          if (cell) {
            const cellStr = String(cell).trim();
            
            // Skip if it's already identified as email, phone, or timestamp
            if (cellStr === email || cellStr === phone || cellStr === timestamp) {
              return;
            }
            
            // Skip if it's just a number (likely an ID)
            if (idPattern.test(cellStr)) {
              return;
            }
            
            // If it's not empty and looks like a name (contains letters, not just numbers)
            if (cellStr.length > 0 && /[a-zA-Z]/.test(cellStr) && !name) {
              name = cellStr;
            }
            // If we have a name but this looks like conversation data (longer text)
            else if (name && cellStr.length > 20 && !conversationData) {
              conversationData = cellStr;
            }
            // Otherwise, it might be source or other data
            else if (!source && cellStr.length > 0) {
              source = cellStr;
            }
          }
        });
        
        // Debug: Log the original row data and mapped data
        console.log(`Row ${index + 1} - Original:`, row);
        console.log(`Row ${index + 1} - Mapped:`, { name, email, phone, conversationData, source, timestamp });
        
        // Parse timestamp if it exists
        let parsedTimestamp = new Date().toISOString();
        if (timestamp) {
          try {
            // Try to parse various date formats
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
              parsedTimestamp = date.toISOString();
            }
          } catch (e) {
            console.warn('Could not parse timestamp:', timestamp);
          }
        }
        
        // Parse conversation data - handle both JSON string and array formats
        let messages: ChatMessage[] = [];
        if (conversationData) {
          try {
            // Try to parse as JSON string first
            if (typeof conversationData === 'string' && conversationData.trim().startsWith('[')) {
              const parsedMessages = JSON.parse(conversationData);
              messages = parsedMessages.filter((msg: any) => msg && msg.role && msg.content).map((msg: any) => ({
                role: msg.role as 'bot' | 'user',
                content: msg.content,
                timestamp: msg.timestamp || parsedTimestamp
              }));
            } else if (typeof conversationData === 'string' && conversationData.trim().startsWith('{')) {
              // Single message object
              const parsedMessage = JSON.parse(conversationData);
              if (parsedMessage && parsedMessage.role && parsedMessage.content) {
                messages = [{
                  role: parsedMessage.role as 'bot' | 'user',
                  content: parsedMessage.content,
                  timestamp: parsedMessage.timestamp || parsedTimestamp
                }];
              }
            } else {
              // Fallback to simple message
              messages = [
                {
                  role: 'user' as const,
                  content: conversationData,
                  timestamp: parsedTimestamp
                }
              ];
            }
          } catch (e) {
            console.warn('Could not parse conversation data:', conversationData, e);
            // Fallback to simple message
            messages = [
              {
                role: 'user' as const,
                content: conversationData || 'Contact from Google Sheets',
                timestamp: parsedTimestamp
              }
            ];
          }
        } else {
          // Default message if no conversation data
          messages = [
            {
              role: 'user' as const,
              content: 'Contact from Google Sheets',
              timestamp: parsedTimestamp
            }
          ];
        }
        
        // If no name found, use the first non-empty cell that's not an ID
        if (!name) {
          for (let i = 0; i < paddedRow.length; i++) {
            const cell = paddedRow[i];
            if (cell && cell !== email && cell !== phone && cell !== timestamp) {
              const cellStr = String(cell).trim();
              if (cellStr.length > 0 && !idPattern.test(cellStr)) {
                name = cellStr;
                break;
              }
            }
          }
        }
        
        // If still no name, show the first few cells for debugging
        if (!name) {
          const firstFewCells = paddedRow.slice(0, 3).filter(cell => cell && String(cell).trim().length > 0);
          name = firstFewCells.length > 0 ? `Data: ${firstFewCells.join(' | ')}` : 'No name found';
        }
        
        const contact = {
          id: `sheet-${index + 1}`,
          chatbotId: `sheet-chatbot-${index + 1}`,
          userId: index + 1,
          name: name || '',
          phone: phone || '',
          email: email || '',
          consentGiven: true, // Default to true for sheet data
          conversationContext: {
            messages: messages,
            variables: {
              page: source || 'Google Sheets',
              referrer: 'Google Sheets Import',
              userAgent: 'Google Sheets API'
            }
          },
          createdAt: parsedTimestamp,
          updatedAt: parsedTimestamp
        };
        
        // Debug: Log the final contact object
        console.log(`Contact ${index + 1}:`, contact);
        
        return contact;
      }).filter((contact: Contact) => contact.name || contact.email || contact.phone); // Filter out completely empty rows
      
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      
      // First try to fetch from Google Sheets
      try {
        const sheetContacts = await fetchFromGoogleSheets();
        if (sheetContacts.length > 0) {
          setContacts(sheetContacts);
          setDataSource('sheets');
          return;
        }
      } catch (sheetError) {
        console.warn('Failed to fetch from Google Sheets, falling back to API:', sheetError);
      }

      // Fallback to existing API
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        "https://totem-consultancy-alpha.vercel.app/api/contacts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data = await response.json();
      setContacts(data);
      setDataSource('api');
    } catch (error) {
      console.error("Error fetching contacts:", error);
       // No demo data - just show empty state
       setContacts([]);
       setDataSource('api');
    } finally {
      setIsLoading(false);
    }
  };




  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chatbot Leads</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage leads from chatbot conversations and webhooks
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Data Source:</span>
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
               dataSource === 'sheets' 
                 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                 : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
             }`}>
               {dataSource === 'sheets' ? 'Google Sheets' : 'API'}
             </span>
          </div>
        </div>
                 <div className="mt-4 sm:mt-0">
        <button
             onClick={fetchContacts}
             disabled={isLoading}
             className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
             <RefreshCw size={20} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
             Refresh
        </button>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                   Name
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                   Email
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                   Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Consent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredContacts.map((contact) => (
                <React.Fragment key={contact.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <User size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {contact.name || ''}
                      </div>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center text-sm text-gray-900 dark:text-white">
                         {contact.email ? (
                           <>
                             <Mail size={14} className="mr-2" />
                             {contact.email}
                           </>
                         ) : (
                           <span></span>
                            )}
                          </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center text-sm text-gray-900 dark:text-white">
                         {contact.phone ? (
                           <>
                             <Phone size={14} className="mr-2" />
                             {contact.phone}
                           </>
                         ) : (
                           <span></span>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <MessageSquare size={16} />
                        <span className="ml-2">Chatbot</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contact.consentGiven 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {contact.consentGiven ? 'Given' : 'Not Given'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(contact.createdAt)}
                      </div>
                    </td>
                      </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No leads found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? 'Try adjusting your search'
                 : dataSource === 'sheets' 
                   ? 'No leads found in Google Sheets. Add some data to your sheet to see leads here.'
                : 'No chatbot leads have been received yet'
              }
            </p>
                         {dataSource === 'sheets' && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                   <p className="text-sm text-blue-700 dark:text-blue-300">
                     <strong>Sheet Format:</strong> Columns A-G: Name, Email, Phone, Conversation (JSON), Source, Status, Timestamp
                   </p>
                 </div>
             )}
          </div>
        )}
      </div>

      
    </div>
  );
};

export default Contacts; 