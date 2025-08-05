import { useState, useEffect } from "react";
import { Globe, UserPlus, KeyRound, ChevronDown } from "lucide-react";

declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: any;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const SettingsPage = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);

    const languageCodes: Record<string, string> = {
      English: "en",
      हिन्दी: "hi",
    };

    const targetLang = languageCodes[lang];
    const googleTranslateSelect = document.querySelector(
      ".goog-te-combo"
    ) as HTMLSelectElement;

    if (googleTranslateSelect) {
      googleTranslateSelect.value = targetLang;
      googleTranslateSelect.dispatchEvent(new Event("change"));
    }
  };

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const initGoogleTranslate = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;

    window.googleTranslateElementInit = initGoogleTranslate;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      delete window.googleTranslateElementInit;
    };
  }, []);

  useEffect(() => {
    const checkLanguage = () => {
      const element = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement;
      if (element) {
        setCurrentLanguage(element.value);
      }
    };

    const interval = setInterval(checkLanguage, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUserSubmit = async (e: any) => {
    e.preventDefault();
    setFormError("");
    setIsLoading(true);

    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (formData.name.length < 2 || formData.name.length > 50) {
      setFormError("Name must be between 2 and 50 characters");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://totem-consultancy-beta.vercel.app/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setFormData({ email: "", name: "", password: "" });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const languages = ["English", "हिन्दी"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6 lg:space-y-8">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-5 lg:pb-8">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-lg">
              Manage your account preferences and settings
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6 lg:p-8">
              <div className="flex items-start gap-4 mb-8">
                <div className="flex-shrink-0 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                  <Globe className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Language Settings
                  </h2>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-base">
                    Choose your preferred language
                  </p>
                </div>
              </div>

              <div className="relative w-full max-w-md">
                <div id="google_translate_element" style={{ display: "none" }}></div>

                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="w-full px-5 py-4 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between transition-colors duration-200"
                >
                  <span className="text-gray-700 dark:text-gray-200 text-lg">{selectedLanguage}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                      isLanguageOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isLanguageOpen && (
                  <div className="absolute w-full mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-10">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          handleLanguageChange(lang);
                          setIsLanguageOpen(false);
                        }}
                        className="w-full px-5 py-4 text-left text-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300 focus:bg-blue-50 dark:focus:bg-blue-900/50 focus:outline-none first:rounded-t-lg last:rounded-b-lg transition-colors duration-200"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add New User */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6 lg:p-8">
              <div className="flex items-start gap-4 mb-8">
                <div className="flex-shrink-0 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                  <UserPlus className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add New User
                  </h2>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-base">
                    Create a new user account
                  </p>
                </div>
              </div>

              <form onSubmit={handleUserSubmit} className="space-y-6">
                {formError && (
                  <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 rounded-lg">
                    {formError}
                  </div>
                )}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      autoComplete="off"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    autoComplete="off"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating User..." : "Add User"}
                </button>
              </form>
            </div>
          </div>

          {/* Password Reset */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6 lg:p-8">
              <div className="flex items-start gap-4 mb-8">
                <div className="flex-shrink-0 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                  <KeyRound className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Password Reset
                  </h2>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-base">
                    Reset your password
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-5 py-4 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 font-medium"
                >
                  Send Reset Link
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;