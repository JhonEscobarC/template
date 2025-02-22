import '../styles/homeContent.css';
import '../styles/about.css';
import { useAnimatedItems } from "@/app/components/animatedItems";

const About = ({ webData }) => {
    useAnimatedItems();
    return (
        <div id='About' className="about-main-div">
            <div className="about-container">
                <div className='about-image-container animated-item'>
                    <img className='about-image' src={webData.about_us.imagen} alt='about' />
                </div>
                <div className="about-text-container animated-item">
                    <h1 className="about-title honk-title">{webData.about_us.titulo}</h1>
                    <p className='about-text'>{webData.about_us.texto}</p>
                </div>
            </div>
        </div>
    );
};

export default About;