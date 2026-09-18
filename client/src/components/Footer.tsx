import * as React from "react";
import { X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../lib/translations";

function Footer() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = React.useState(() => {
    const saved = sessionStorage.getItem("footer-visible");
    return saved === null ? true : saved === "true";
  });

  function handleClose() {
    setIsVisible(false);
    sessionStorage.setItem("footer-visible", "false");
  }

  if (!isVisible) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 py-3 px-4 text-center bg-white/50 backdrop-blur-sm border-t border-gray-200">
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute top-0 right-2 -mt-1 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label={getTranslation(language, "close")}
        >
          <X className="h-4 w-4" />
        </button>
        <a
          href="http://paypal.me/enginsarak"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          {getTranslation(language, "supportProject")}
        </a>
      </div>
    </footer>
  );
}

export default Footer;
