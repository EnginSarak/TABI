import * as React from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import CurrencyConverter from "./components/CurrencyConverter";

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#F0EDE6]">
        <CurrencyConverter isDark={false} />
      </div>
    </LanguageProvider>
  );
}

export default App;
