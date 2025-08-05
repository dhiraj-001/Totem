import { useState } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

interface FormData {
  firstName: string;
  lastName: string;
  fromDate: string;
  toDate: string;
  courseName: string;
  description: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const CertificateGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    fromDate: '',
    toDate: '',
    courseName: '',
    description: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
  
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }
    if (!formData.fromDate) {
      newErrors.fromDate = 'Start date is required';
    }
    if (!formData.toDate) {
      newErrors.toDate = 'End date is required';
    }
    if (formData.fromDate && formData.toDate) {
      if (new Date(formData.fromDate) > new Date(formData.toDate)) {
        newErrors.fromDate = 'Start date must be before end date';
      }
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const sendToBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login page if no token
        window.location.href = '/login'; // Adjust this path to match your login route
        throw new Error('Please login first to generate certificates');
      }
  
      // Verify token format
      if (!token.startsWith('Bearer ') && !token.startsWith('bearer ')) {
        const formattedToken = `Bearer ${token}`;
        
        const response = await fetch('https://totem-consultancy-alpha.vercel.app/api/certificates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': formattedToken
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            courseName: formData.courseName,
            description: formData.description,
            fromDate: formData.fromDate,
            tomDate: formData.toDate
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            // Token expired or invalid - redirect to login
            window.location.href = '/login'; // Adjust this path to match your login route
            throw new Error('Session expired. Please login again.');
          }
          throw new Error(errorData.message || 'Failed to create certificate');
        }
  
        const data = await response.json();
        return data;
      } else {
        // Token already has Bearer prefix
        const response = await fetch('https://totem-consultancy-alpha.vercel.app/api/certificates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            courseName: formData.courseName,
            description: formData.description,
            fromDate: formData.fromDate,
            tomDate: formData.toDate
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            // Token expired or invalid - redirect to login
            window.location.href = '/login'; // Adjust this path to match your login route
            throw new Error('Session expired. Please login again.');
          }
          throw new Error(errorData.message || 'Failed to create certificate');
        }
  
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Error saving certificate data:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to save certificate data');
    }
  };

  const generateDocument = async () => {
  if (!validateForm()) {
    return;
  }

  setIsGenerating(true);
  try {
    // First, send data to backend
    await sendToBackend();
    
    // Only proceed with PDF generation if backend save was successful
    const response = await fetch('/demo.docx');
    if (!response.ok) {
      throw new Error('Failed to load certificate template');
    }
    const requestData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      courseName: formData.courseName,
      description: formData.description,
      fromDate: formData.fromDate,
      tomDate: formData.toDate
    };
    console.log('Sending data to backend:', requestData);
    
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
  
      const doc = new Docxtemplater()
        .loadZip(zip)
        .setData({
          firstName: formData.firstName,
          lastName: formData.lastName,
          fromDate: formData.fromDate ? formatDate(formData.fromDate) : '',
          toDate: formData.toDate ? formatDate(formData.toDate) : '',
          courseName: formData.courseName,
          description: formData.description,
          fullName: `${formData.firstName} ${formData.lastName}`,
          currentDate: formatDate(new Date().toISOString()),
          date: formatDate(new Date().toISOString()),
        })
        .render();
  
      const docxBlob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
  
      const formDataApi = new FormData();
      formDataApi.append('file', docxBlob, 'document.docx');
  
      const SECRET = 'secret_EfFZQ3ETaGOJyLuh';
      console.log('Sending conversion request...');
      
      const convertResponse = await fetch(
        `https://v2.convertapi.com/convert/docx/to/pdf?Secret=${SECRET}`, {
          method: 'POST',
          body: formDataApi,
        }
      );
  
      if (!convertResponse.ok) {
        const errorText = await convertResponse.text();
        console.error('Conversion API Error Response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`Conversion API error: ${errorData.Message || errorText}`);
        } catch (e) {
          throw new Error(`Conversion API error: ${errorText}`);
        }
      }
  
      const convertResult = await convertResponse.json();
      console.log('Conversion result:', convertResult);
  
      if (!convertResult.Files || !Array.isArray(convertResult.Files) || convertResult.Files.length === 0) {
        throw new Error('Conversion response missing Files array');
      }
  
      const pdfFile = convertResult.Files[0];
      if (!pdfFile || !pdfFile.FileData) {
        throw new Error('Conversion response missing PDF data');
      }
  
      const byteCharacters = atob(pdfFile.FileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
  
      if (pdfBlob.size === 0) {
        throw new Error('Generated PDF is empty');
      }
  
      saveAs(pdfBlob, `${formData.firstName}_${formData.lastName}_Certificate.pdf`);
      console.log('PDF saved successfully');
  
    } catch (error) {
      console.error('Detailed error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      alert(`Error generating certificate: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        {/* Header Section */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Certificate Generator
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fill in the details below to generate a certificate
              </p>
            </div>
            <button
              onClick={generateDocument}
              disabled={isGenerating}
              className={`hidden sm:block px-6 py-2 rounded-lg font-medium text-white min-w-[160px] transition-colors
                ${isGenerating 
                  ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Certificate'}
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-4 sm:p-6">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:text-white 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow
                    ${errors.firstName 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                    }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:text-white 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow
                    ${errors.lastName 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                    }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="fromDate"
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:text-white 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow
                    ${errors.fromDate 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                {errors.fromDate && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.fromDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="toDate"
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:text-white 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow
                    ${errors.courseName 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                    }`}
                  placeholder="Enter course name"
                />
                {errors.courseName && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.courseName}</p>
                )}
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  placeholder="Enter certificate description"
                />
              </div>
            </div>

            {/* Mobile Generate Button */}
            <button
              onClick={generateDocument}
              disabled={isGenerating}
              className={`sm:hidden w-full px-6 py-3 rounded-lg font-medium text-white transition-colors
                ${isGenerating 
                  ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Certificate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;