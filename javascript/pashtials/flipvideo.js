/*KADA KLIKNE NA VIDEO OKRENE SE VIDEO ZA 180STEPENI I PRIKAZE TEKST  */

export function initVideoFlip() {
    let isFlipped = false;
    
    $('.flip-trigger').click(function() {
        const flipContainer = $('.video-flip-container');
        const $btn = $(this);
        
        if (!isFlipped) {
            // Flip na zadnju stranu
            flipContainer.addClass('flipped');
            $btn.text('Back to Video');
            isFlipped = true;
        } else {
            // Flip na prednju stranu
            flipContainer.removeClass('flipped');
            $btn.text('More');
            isFlipped = false;
        }
    });
}