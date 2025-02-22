import '../styles/preHeader.css';

const PreHeader = ({ webData }) => {
    return (
        <header className="preHeader-main-container">
            <div className="social-media-icon">
                <a target="_blank" rel="noopener noreferrer" href={webData.link1}>
                    <img className="media-logo-footer facebook-logo" src="https://imagenes-apartado.s3.us-east-2.amazonaws.com/facebook.png" alt="Facebook" />
                </a>
                <a target="_blank" rel="noopener noreferrer" href={webData.link2}>
                    <img className="media-logo-footer instagram-logo" src="https://imagenes-apartado.s3.us-east-2.amazonaws.com/instagram.png" alt="Instagram" />
                </a>
                <a target="_blank" rel="noopener noreferrer" href={webData.link3}>
                    <img className="media-logo-footer whatsapp-logo" src="https://imagenes-apartado.s3.us-east-2.amazonaws.com/whatsapp.png" alt="WhatsApp" />
                </a>
            </div>
            <nav className="navigation">
                <a href="/#ContactUs">Contáctanos</a>
            </nav>
        </header>
    );
};

export default PreHeader;