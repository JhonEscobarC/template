import '../styles/preHeader.css';

const PreHeader = ({ webData }) => {
    return (
        <header className="preHeader-main-container">
            <div className="social-media-icon">
                <a target="_blank" rel="noopener noreferrer" href={webData.link1}>
                    <div className="icon-wrapper facebook">
                        <img className="media-logo-footer" src="https://imagenes-apartado.s3.us-east-2.amazonaws.com/facebook.png" alt="Facebook" />
                    </div>
                </a>
                <a target="_blank" rel="noopener noreferrer" href={webData.link2}>
                    <div className="icon-wrapper instagram">
                        <img className="media-logo-footer" src="https://imagenes-apartado.s3.us-east-2.amazonaws.com/instagram.png" alt="Instagram" />
                    </div>
                </a>
                <a target="_blank" rel="noopener noreferrer" href={webData.link3}>
                    <div className="icon-wrapper whatsapp">
                        <img className="media-logo-footer" src="https://imagenes-apartado.s3.us-east-2.amazonaws.com/whatsapp.png" alt="WhatsApp" />
                    </div>
                </a>
            </div>
            <nav className="navigation">
                <a href="#ContactUs">Contáctanos</a>
            </nav>
        </header>
    );
};

export default PreHeader;