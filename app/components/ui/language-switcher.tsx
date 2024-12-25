// components/language-switcher.tsx
"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "zh", name: "Chinese" },
  { code: "ko", name: "Korean" },
  { code: "ja", name: "Japanese" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  // Get current language from URL or localStorage
  const currentLang =
    typeof window !== "undefined"
      ? localStorage.getItem("preferred-language") || "en"
      : "en";

  const handleLanguageChange = useCallback(
    (language: string) => {
      localStorage.setItem("preferred-language", language);
      // Refresh the current page to update content
      router.refresh();
    },
    [router],
  );

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
