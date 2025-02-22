import '../styles/header.css';

const TheHeader = ({ webData }) => {
    return (
        <header className="header">
            <div className="logo">
                <img src={webData.header?.logo} alt="Logo" />
            </div>
            <nav className="navbar">
                <ul>
                    <li><a href="#Home">Inicio</a></li>
                    <li><a href="#Catalogue">Catálogo</a></li>
                    <li><a href="#About">Nosotros</a></li>
                    <li><a href="#ContactUs">Contáctanos</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default TheHeader;