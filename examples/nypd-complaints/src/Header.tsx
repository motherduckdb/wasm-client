import "./Header.css";
import motherDuckLogo from "./assets/motherduck_logo.svg";

export function Header() {
  return (
    <div id="header">
      <div id="title">
        <a href="https://motherduck.com" target="_blank">
          <img src={motherDuckLogo} className="logo" alt="MotherDuck logo" />
        </a>
      </div>
      <div id="subtitle" className="text-gray-600">
        WASM Client Library Example
      </div>
    </div>
  );
}
