import * as React from "react";

interface FlagIconProps {
  code: "JPY" | "USD" | "GBP" | "TRY" | "CHF" | "EN" | "DE";
  size?: number;
}

function Japan() {
  return (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="20" fill="#fff" />
      <circle cx="15" cy="10" r="6" fill="#BC002D" />
    </svg>
  );
}

function USA() {
  const stripeH = 20 / 13;
  return (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      {Array.from({ length: 13 }).map((_, i) => (
        <rect key={i} x="0" y={i * stripeH} width="30" height={stripeH} fill={i % 2 === 0 ? "#B22234" : "#fff"} />
      ))}
      <rect x="0" y="0" width="12" height={stripeH * 7} fill="#3C3B6E" />
      {[0,1,2,3,4].map(row =>
        [0,1,2,3,4,5].filter((_, ci) => !(row % 2 === 1 && ci === 5)).map((col, ci) => {
          const cols = row % 2 === 0 ? 6 : 5;
          const xStep = 12 / (row % 2 === 0 ? 6 : 5);
          const x = (row % 2 === 0 ? xStep / 2 : xStep / 2) + ci * xStep;
          const y = (stripeH * 7 / 5) * row + (stripeH * 7 / 10);
          return <circle key={`${row}-${ci}`} cx={x} cy={y} r="0.55" fill="#fff" />;
        })
      )}
    </svg>
  );
}

function UK() {
  return (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="20" fill="#012169" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" strokeWidth="4" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" strokeWidth="2.4" />
      <path d="M15,0 V20 M0,10 H30" stroke="#fff" strokeWidth="6" />
      <path d="M15,0 V20 M0,10 H30" stroke="#C8102E" strokeWidth="3.6" />
    </svg>
  );
}

function Turkey() {
  return (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="20" fill="#E30A17" />
      <circle cx="13.5" cy="10" r="4.5" fill="#fff" />
      <circle cx="15" cy="10" r="3.4" fill="#E30A17" />
      <polygon
        points="18.5,10 20.2,8.6 19.8,10.7 21.7,11.5 19.7,11.9 19.9,14 18.5,12.4 17.1,14 17.3,11.9 15.3,11.5 17.2,10.7 16.8,8.6"
        fill="#fff"
        transform="scale(0.72) translate(7.2, 3.9)"
      />
    </svg>
  );
}

function Switzerland() {
  return (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="20" fill="#FF0000" />
      <rect x="13" y="5.5" width="4" height="9" fill="#fff" />
      <rect x="10" y="8.5" width="10" height="3" fill="#fff" />
    </svg>
  );
}

function Germany() {
  return (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="30" height="6.67" fill="#000" />
      <rect x="0" y="6.67" width="30" height="6.66" fill="#DD0000" />
      <rect x="0" y="13.33" width="30" height="6.67" fill="#FFCE00" />
    </svg>
  );
}

function FlagIcon({ code, size = 30 }: FlagIconProps) {
  const width = size;
  const height = Math.round(size * (2 / 3));

  const flag = {
    JPY: <Japan />,
    USD: <USA />,
    GBP: <UK />,
    TRY: <Turkey />,
    CHF: <Switzerland />,
    EN:  <UK />,
    DE:  <Germany />,
  }[code];

  return (
    <span
      style={{
        display: "inline-flex",
        width,
        height,
        borderRadius: 3,
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.12)",
      }}
    >
      {flag}
    </span>
  );
}

export default FlagIcon;
