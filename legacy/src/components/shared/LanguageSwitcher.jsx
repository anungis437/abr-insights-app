import React from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher({ variant = "ghost", size = "default" }) {
  const { language, switchLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden md:inline">
            {language === 'en' ? 'EN' : 'FR'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => switchLanguage('en')}
          className={language === 'en' ? 'bg-teal-50' : ''}
        >
          <span className="mr-2">🇨🇦</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLanguage('fr')}
          className={language === 'fr' ? 'bg-teal-50' : ''}
        >
          <span className="mr-2">🇫🇷</span>
          Français
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}