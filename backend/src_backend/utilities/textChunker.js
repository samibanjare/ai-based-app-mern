/**
 * Split text into chunks for better AI processing
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Target size per chunk (in words)
 * @param {number} overlap - Number of words to overlap between chunks
 * @return {Array<{content: string, chunkIndex: number, pageNumber: number}>}
 */

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if (!text || text.trim().length === 0) {
        return [];
    }

    // Clean text while preserving paragraph structure
    const cleanedText = text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/ \n/g, '\n')
        .replace(/\n /g, '\n')
        .trim();

    // Split by paragraph
    const paragraphs = cleanedText
        .split(/\n+/)
        .filter(p => p.trim().length > 0);

    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        // Case 1: Very large paragraph → split directly
        if (paragraphWordCount > chunkSize) {
            if (currentChunk.length > 0) {
                chunks.push({
                    content: currentChunk.join('\n\n'),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });
                currentChunk = [];
                currentWordCount = 0;
            }

            for (let i = 0; i < paragraphWordCount; i += (chunkSize - overlap)) {
                chunks.push({
                    content: paragraphWords.slice(i, i + chunkSize).join(' '),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });
            }
            continue;
        }

        // Case 2: Adding paragraph exceeds chunk size
        if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
            chunks.push({
                content: currentChunk.join('\n\n'),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });

            // Create overlap from previous chunk
            const overlapWords = currentChunk
                .join(' ')
                .split(/\s+/)
                .slice(-overlap);

            currentChunk = overlapWords.length ? [overlapWords.join(' ')] : [];
            currentWordCount = overlapWords.length;
        }

        // Add paragraph to current chunk
        currentChunk.push(paragraph.trim());
        currentWordCount += paragraphWordCount;
    }

    // Add last chunk
    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join('\n\n'),
            chunkIndex: chunkIndex++,
            pageNumber: 0
        });
    }

    // Fallback: no chunks created
    if (chunks.length === 0 && cleanedText.length > 0) {
        const words = cleanedText.split(/\s+/);
        for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
            chunks.push({
                content: words.slice(i, i + chunkSize).join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });
        }
    }

    return chunks;
};

/**
 * find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of chunks
 * @param {string} query - Search query
 * @param {number} maxChunks - Maximum chunks to return
 * @returns {Array<Object>}
 */

export const findRelevantChunks = (chunks,query, maxChunks =3)=>{
    if(!chunks || chunks.length === 0|| !query){
        return [];
    }

    //common stop words to exclude
    const stopWords = new Set([
        'the', 'is', 'at', 'which', 'on', 'a', 'an','and', 'or', 'but',
        'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it'
    ]);

    //Extract and clean query words
    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(w=>w.length>2 && !stopWords.has(w));
    
    if(queryWords.length===0){
        //Return clean chunk objects without Mongoose metadata
        return chunks.slice(0, maxChunks).map(chunk=>({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id
        }));
    }

    const scoredChunks = chunks.map((chunk,index)=>{
        const content = chunk.content.toLowerCase();
        const contentWords = content.split(/\s+/).length;

        let score =0;
        //score each query word
        for(const word of queryWords){
            //Exact word match (higher score)
            const exactMatches = (content.match(new RegExp(`\\b${word}\\b`, 'g'))|| []).length;
            score += exactMatches*3;

            //partial match
            const partialMatches = (content.match(new RegExp(word, 'g'))|| []).length;
            score += Math.max(0, partialMatches- exactMatches)*1.5;
        }

        //Bonus multiple query words found
        const uniqueWordsFound = queryWords.filter(word=>
            content.includes(word)
        ).length;
        if(uniqueWordsFound>1){
            score += uniqueWordsFound*2
        } 

        //Normalize by content length
        const normalizedScore = score/ Math.sqrt(contentWords);

        //Small bonus for earlier chunks
        const positionBonus = 1 -(index/ chunks.length)*0.1;

        //Return clean object without Mongoose metadata
        return{
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore * positionBonus,
            rawScore: score,
            matchedWords: uniqueWordsFound
        }
    })

    return scoredChunks
        .filter(chunk=>chunk.score>0)
        .sort((a, b)=>{
            if(b.score !== a.score){
                return b.score- a.score;
            }
            if(b.matchedWords !== a.matchedWords){
                return b.matchedWords- a.matchedWords;
            }
            return a.chunkIndex- b.chunkIndex;
        })
        .slice(0,maxChunks);
};
