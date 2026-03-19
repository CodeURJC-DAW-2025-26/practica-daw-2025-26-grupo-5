document.addEventListener('DOMContentLoaded', () => {
    const loadMoreBtn = document.getElementById('load-more');
    const spinner = document.getElementById('spinner');
    const container = document.getElementById('product-container');

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            // Visual Feedback
            spinner.classList.remove('d-none');
            this.disabled = true;

            // Extract the offset where we left off
            let currentOffset = parseInt(this.getAttribute('data-offset')) || 0;

            // Extract the search parameters from the URL if they exist
            const urlParams = new URLSearchParams(window.location.search);
            const queryParam = urlParams.get('query') || '';
            const categoryParam = urlParams.get('category') || '';

            // Perform the fetch passing offset, query, and category
            const fetchPromise = fetch(`/load-more-products?offset=${currentOffset}&query=${encodeURIComponent(queryParam)}&category=${encodeURIComponent(categoryParam)}`)
                .then(response => {
                    if (!response.ok) throw new Error('Error loading products');
                    return response.text();
                });

            const delayPromise = new Promise(resolve => setTimeout(resolve, 800));

            Promise.all([fetchPromise, delayPromise])
                .then(([html]) => {
                    container.insertAdjacentHTML('beforeend', html);

                    const noMoreMarker = container.querySelector('#no-more-marker');

                    if (noMoreMarker) {
                        this.innerText = "No more treasures found";
                        this.classList.replace('btn-load-more', 'btn-no-more');
                        this.disabled = true;

                        noMoreMarker.remove();
                    } else {
                        // Update the offset by adding 10 for the next request
                        this.setAttribute('data-offset', currentOffset + 10);
                        this.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Could not load more products.");
                    this.disabled = false;
                })
                .finally(() => {
                    spinner.classList.add('d-none');
                });
        });
    }
});