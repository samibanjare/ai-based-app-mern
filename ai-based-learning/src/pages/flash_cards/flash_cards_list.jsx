import React, {useState, useEffect} from 'react';
import flashcardService from '../../services/flashcard_service.js';
import PageHeader from '../../components/common/pageHeader.jsx';
import Spinner from '../../components/common/spinner.jsx';
import FlashcardSetCard from '../../pages/flash_cards/flashcard_set.jsx';
import EmptyState from '../../components/common/EmptySpace.jsx';
import toast from 'react-hot-toast';

const FlashCardsListPage =()=>{
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const fetchFlashcardSets = async()=>{
            try {
                const response = await flashcardService.getAllFlashcardSets();
                console.log("fetched flashcard sets", response.data);
                setFlashcardSets(response.data);
            } catch (error) {
                toast.error("Failed to fetch flashcard sets. Please try again later.");
                console.error("Error fetching flashcard sets:", error);
            } finally{
                setLoading(false);
            }
        };
        fetchFlashcardSets();
    },[]);

    const renderContent =()=>{
        if(loading){
            return <Spinner/>
        }

    if(flashcardSets.length === 0){
        return(
            <EmptyState
            title="No flashcard set is found"
            description="You haven't generated any flashcards yet. Go to a document to create your first det."
            />
        );
    }

    return (
        <div className="">
            {flashcardSets.map((set)=>(
                <FlashcardSetCard key={set._id} flashcardSet={set} />
            ))}
        </div>
    )
}
    return(
        <div>
            <PageHeader title="All Flashcard Sets"/>
            {renderContent()}
        </div>
    )
}

export default FlashCardsListPage