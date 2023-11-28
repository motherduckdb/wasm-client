import "./Header.css";
import motherDuckLogo from "./assets/motherduck_logo.svg";

export function Header() {
  return (
    <div id="header">
      <div id="title">
        <a href="https://motherduck.com" target="_blank">
          <img src={motherDuckLogo} alt="MotherDuck logo" />
        </a>
      </div>
      <div id="subtitle">
        WASM Client Example: Mosaic Integration
      </div>
    </div>
  );
}
