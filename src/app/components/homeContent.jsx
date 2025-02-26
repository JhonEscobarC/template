import '../styles/homeContent.css';

const HomeContent = ({ webData }) => {
    return (
        <div id='Home' className="home-main-div">
            <div className="main-container">
                <h1 className="main-title animated-item">{webData.home?.titulo}</h1>
                <div className="main-image-container animated-item">
                    <img className="home-main-image" src={webData.home?.imagen} alt="mainImage" />
                </div>
                <div className="main-text">
                    <nav className="navHome">
                        <a href="#About" className="homeBorder">Conócenos</a>
                        <a href="#Catalogue" className="homeBorder">Productos</a>
                        <a href="#ContactUs" className="homeBorder">Contáctanos</a>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default HomeContent;