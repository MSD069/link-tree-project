import React from 'react';
import styles from './sample.module.css';

// Updated import paths
import audiomack from '../assets/audiomack.png';
import bandsintown from '../assets/bandsintown.png';
import bonfire from '../assets/bonfire.png';
import books from '../assets/books.png';
import buyMeAgift from '../assets/buymeagift.png';
import cameo from '../assets/cameo.png';
import clubhouse from '../assets/clubhouse.png';
import community from '../assets/community.png';
import contactDetails from '../assets/contactdetails.png';

const Sample = () => {
    const platformsData = [
        { src: audiomack, title: "Audiomack", description: "Add an Audiomack player to your Linktree" },
        { src: bandsintown, title: "Bandsintown", description: "Drive ticket sales by listing your events" },
        { src: bonfire, title: "Bonfire", description: "Display and sell your custom merch" },
        { src: books, title: "Books", description: "Promote books on your Linktree" },
        { src: buyMeAgift, title: "Buy Me A Gift", description: "Let visitors support you with a small gift" },
        { src: cameo, title: "Cameo", description: "Make impossible fan connections possible" },
        { src: clubhouse, title: "Clubhouse", description: "Let your community in on the conversation" },
        { src: community, title: "Community", description: "Build an SMS subscriber list" },
        { src: contactDetails, title: "Contact Details", description: "Easily share downloadable contact details" },
    ];

    return (
        <div className={styles.child10}>
            {platformsData.map((platform, index) => (
                <div className={styles.inchild} key={index}>
                    <img src={platform.src} alt={platform.title} />
                    <div className={styles.child8}>

                    <h4>{platform.title}</h4>
                    <p>{platform.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Sample;