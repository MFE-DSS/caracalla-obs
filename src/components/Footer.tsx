import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <span className="footer__brand">Caracalla</span>
        <span className="footer__sep">·</span>
        <span className="footer__legal">Mentions légales</span>
        <span className="footer__sep">·</span>
        <span className="footer__legal">CGV</span>
        <span className="footer__sep">·</span>
        <span className="footer__legal">Contact</span>
      </div>
    </footer>
  );
}
