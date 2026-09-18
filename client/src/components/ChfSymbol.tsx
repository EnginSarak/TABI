import * as React from "react";

interface Props {
  style?: React.CSSProperties;
  className?: string;
}

function ChfSymbol({ style, className }: Props) {
  return (
    <svg
      viewBox="0 0 9 13"
      style={{ display: "inline-block", width: "0.65em", height: "0.95em", verticalAlign: "-0.05em", ...style }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      className={className}
    >
      <line x1="2" y1="0.8" x2="2" y2="12.2" />
      <line x1="2" y1="0.8" x2="8.2" y2="0.8" />
      <line x1="2" y1="4.8" x2="7" y2="4.8" />
      <line x1="0.2" y1="7.8" x2="3.8" y2="7.8" />
    </svg>
  );
}

export default ChfSymbol;
