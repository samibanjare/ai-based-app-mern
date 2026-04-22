import React, {useState, useEffect} from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Plus, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import flashcardService from "../../services/flashcard_service.js";
import aiService from "../../services/ai_service.js";
import PageHeader from "../../components/common/pageHeader.jsx";
import Spinner from "../../components/common/spinner.jsx"
import EmptySpace from '../../components/common/EmptySpace.jsx';
import Flashcard from "../../components/flashcards/flashcard.jsx";
import Modal from "../../components/common/modal.jsx";
import Button from "../../components/common/button.jsx";

const FlashcardPage = ()=>{
    const {id: documentId} = useParams();
    const [flashcardSets, setFlashcardSets] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [deleting, setDeleting] = useState(null);

    const fetchFlashcards = async()=>{
        try {
            const response = await flashcardService.getFlashcardsForDocument(documentId);
            setFlashcardSets(response.data[0]);
            setFlashcards(response.data[0].cards||[]);
        } catch (error) {
            toast.error("Failed to fetch flashcards. Please try again later.");
            console.error("Error fetching flashcards:", error);
        } finally{
            setLoading(false);
        }   
    };

    useEffect(()=>{
        fetchFlashcards();
    }, [documentId]);

    const handleGenerateFlashcards = async()=>{
        setGenerating(true);
        try {
            await aiService.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully!");
            fetchFlashcards();
        } catch (error) {
            toast.error("Failed to generate flashcards. Please try again later.");
            console.error("Error generating flashcards:", error);
        } finally {
            setGenerating(false);
        }
    }

    const handleNextCard =()=>{
        handleReview(currentCardIndex)
        setCurrentCardIndex((prevIndex)=>(prevIndex+1)%flashcards.length);
    };

    const handlePrevCard =()=>{
        handleReview(currentCardIndex)
        setCurrentCardIndex((prevIndex)=>(prevIndex-1+flashcards.length)%flashcards.length);
    };

    const handleReview = async(index)=>{
        const currentCard = flashcards[index];
        if(!currentCard?._id) return;
        try {
            await flashcardService.reviewFlashcard(currentCard._id, index); 
            toast.success("Flashcard reviewed!");
        } catch (error) {
            toast.error("Failed to review flashcard. Please try again later.");
        }
    };

    const handleToggleStar = async(cardId)=>{
        try {
            await flashcardService.toggleStar(cardId);
            setFlashcards((prevFlashcards)=>
                prevFlashcards.map((card)=>
                    card._id === cardId ? {...card, isStarred: !card.isStarred} : card
                )
            );
            toast.success("Flashcard starred!");
        } catch (error) {
            toast.error("Failed to star flashcard. Please try again later.");
        }  
    }

    const handleDeleteFlashcard = async()=>{
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(flashcardSets._id);
            toast.success("Flashcard deleted!");
            setIsDeleteModalOpen(false);
            setCurrentCardIndex(0);
            fetchFlashcards(); //Refetch to show empty state
        } catch (error) {
            toast.error(error.message ||"Failed to delete flashcard. Please try again later.");
        }
        finally{
            setDeleting(false);
        }
    }

    const renderFlascardContent =()=>{
        if(loading){
            return <Spinner/>
        }   
        if(flashcards.length === 0){
            return(
                <EmptySpace
                title="No flashcards found"
                description="You haven't generated any flashcards for this document yet. Click the button below to create flashcards and start studying!"
                />
            )
        }
        const currentCard = flashcards[currentCardIndex];

        return(
            <div className="flex flex-col items-center gap-6">
                <div className="w-full max-w-md">
                    <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar}/>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                    onClick={handlePrevCard}
                    variant="secondary"
                    disabled={flashcards.length <= 1}
                    >
                        <ChevronLeft size={16}/> Previous
                    </Button>
                    <span className="text-sm text-neutral-600">
                        {currentCardIndex+1}/{flashcards.length}
                    </span>
                    <Button
                    onClick={handleNextCard}
                    variant="secondary"
                    disabled={flashcards.length <= 1}
                    >
                        Next <ChevronRight size={16}/>
                    </Button>
                </div>
            </div>
        )
    }

    


return(
    <div>
        <div className="mb-4">
            <Link
            to={`/documents/${documentId}/`}
            className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
                <ArrowLeft size={16}/>
                Back to Document
            </Link> 
        </div>
        <PageHeader
        title="Flashcards"
        >
            <div className="flex gap-2">
                {!loading && (flashcards.length > 0 ? (
                    <>
                    <Button
                    onClick={()=>setIsDeleteModalOpen(true)}
                    disabled={deleting}
                    >
                        <Trash2 size={16}/> Delete Set
                    </Button>
                    </>
                ):(
                    <Button
                    onClick={handleGenerateFlashcards} disabled={generating}
                    >
                        {generating ? (
                            <Spinner size={16}/>
                        ):(
                            <>
                            <Plus size={16}/> Generate Flashcards
                            </> 
                        )}
                    </Button>
                ))}
                
            </div>
        </PageHeader>

        {renderFlascardContent()}
        <Modal
        isOpen={isDeleteModalOpen}
        onClose={()=>setIsDeleteModalOpen(false)}
        title="Confirm Delete Flashcard Set"
        >
            <div className="space-y-4">
                <p className="text-sm text-neutral-600">
                    Are you sure you want to delete this flashcard set? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                    <Button
                    type="button"
                    variant="secondary"
                    onClick={()=>setIsDeleteModalOpen(false)}
                    disabled={deleting}
                    className="bg-red-500 hover:bg-red-600 text-white active:bg-red-700 focus:ring-red-500"
                    >
                        {deleting? "Deleting...":"Delete"}
                    </Button>
                </div>
            </div>
        </Modal>
    </div>
    )
}



export default FlashcardPage