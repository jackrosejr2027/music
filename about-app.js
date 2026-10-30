document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('features-grid');
    if (!grid || typeof ABOUT_FEATURES_DATA === 'undefined') return;

    ABOUT_FEATURES_DATA.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.className = 'feature-category';
        
        let html = `<h2>${cat.category}</h2><ul class="feature-list">`;
        cat.items.forEach(item => {
            html += `<li><strong>${item.name}</strong> <span class="path">${item.path}</span></li>`;
        });
        html += `</ul>`;
        
        catDiv.innerHTML = html;
        grid.appendChild(catDiv);
    });
});