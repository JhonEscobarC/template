import '../styles/catalogue.css';
import { useAnimatedItems } from "@/app/components/animatedItems";

const Catalogue = ({ webData }) => {
    useAnimatedItems();
    return (
        <div id='Catalogue' className="catalogue-main-div">
            <div className="catalogue-container">
                <h1 className="catalogue-title honk-title animated-item">{webData.catalogo.titulo}</h1>
                <div className="catalogue-image-container animated-item">
                    <img className="catalogue-main-image" src={webData.catalogo.imagen} alt="catalogueImage" />
                </div>
            </div>
        </div>
    );
};

export default Catalogue;