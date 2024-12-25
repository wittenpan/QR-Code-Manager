// contexts/language-context.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const storedLanguage = localStorage.getItem("preferred-language") || "en";
    setLanguage(storedLanguage);
  }, []);

  const handleSetLanguage = (newLanguage: string) => {
    localStorage.setItem("preferred-language", newLanguage);
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
