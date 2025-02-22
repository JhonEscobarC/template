import '../styles/homeContent.css';
import '../styles/contactUs.css';
import { useAnimatedItems } from "@/app/components/animatedItems";

const ContactUs = ({ webData }) => {
    useAnimatedItems();
    return (
        <div id='ContactUs' className="contact-main-div">
            <div className="contact-container">
                <div className="contact-text-container animated-item">
                    <h1 className="contact-title honk-title">Contáctanos</h1>
                    <p className='about-text'>{webData.contact_us.texto}</p>
                    <a href={webData.link3} target="_blank" rel="noopener noreferrer">
                        <button className="whatsapp-button">Contáctanos por WhatsApp</button>
                    </a>
                </div>
                <div className='contact-image-container animated-item'>
                    <img className='contact-image' src={webData.contact_us.imagen} alt='contact' />
                </div>
            </div>
        </div>
    );
};

export default ContactUs;