import '../styles/footer.css';

const TheFooter = ({ webData }) => {
    return (
        <footer className="footer">
            <div className="logo-footer">
                <img src={webData.footer.logo} alt="Logo" />
            </div>
            <div className="slogan-footer">
                <h3>{webData.footer.slogan}</h3>
            </div>
            <div className="social-media">
                <h3>{webData.footer.correo}</h3>
                <h3>{webData.footer.numero}</h3>
                <h3>Síguenos</h3>
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
            </div>
        </footer>
    );
};

export default TheFooter;