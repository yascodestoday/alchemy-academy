export function shareProduct(platform) {
    const url = window.location.href;
    const title = document.title;
    const text = "Check out this amazing book at Alchemy Academy!";

    switch (platform) {
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, 
                '_blank', 'width=600,height=400');
            break;

        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, 
                '_blank', 'width=600,height=400');
            break;

        case 'copy':
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
            });
            break;
    }
} 