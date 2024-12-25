// components/menu-item-form/translation-manager.tsx
"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "zh", name: "Chinese" },
  { code: "ko", name: "Korean" },
  { code: "ja", name: "Japanese" },
];

interface Translation {
  language: string;
  name: string;
  description: string | null;
}

interface TranslationManagerProps {
  translations: Translation[];
  onChange: (translations: Translation[]) => void;
  isDisabled?: boolean;
}

export function TranslationManager({
  translations,
  onChange,
  isDisabled,
}: TranslationManagerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  const handleAddTranslation = () => {
    if (!selectedLanguage) return;

    // Check if translation for this language already exists
    if (translations.some((t) => t.language === selectedLanguage)) return;

    onChange([
      ...translations,
      { language: selectedLanguage, name: "", description: "" },
    ]);
    setSelectedLanguage("");
  };

  const handleUpdateTranslation = (
    language: string,
    field: "name" | "description",
    value: string,
  ) => {
    onChange(
      translations.map((t) =>
        t.language === language ? { ...t, [field]: value } : t,
      ),
    );
  };

  const handleRemoveTranslation = (language: string) => {
    onChange(translations.filter((t) => t.language !== language));
  };

  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => !translations.some((t) => t.language === lang.code),
  );

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {translations.map((translation) => (
          <div
            key={translation.language}
            className="border rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">
                {
                  SUPPORTED_LANGUAGES.find(
                    (lang) => lang.code === translation.language,
                  )?.name
                }
              </h3>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveTranslation(translation.language)}
                disabled={isDisabled}
              >
                Remove
              </Button>
            </div>
            <Input
              value={translation.name}
              onChange={(e) =>
                handleUpdateTranslation(
                  translation.language,
                  "name",
                  e.target.value,
                )
              }
              placeholder="Translated name"
              disabled={isDisabled}
            />
            <Textarea
              value={translation.description || ""}
              onChange={(e) =>
                handleUpdateTranslation(
                  translation.language,
                  "description",
                  e.target.value,
                )
              }
              placeholder="Translated description"
              disabled={isDisabled}
            />
          </div>
        ))}
      </div>

      {availableLanguages.length > 0 && (
        <div className="flex gap-2">
          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
            disabled={isDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={handleAddTranslation}
            disabled={isDisabled}
          >
            Add Translation
          </Button>
        </div>
      )}
    </div>
  );
}
