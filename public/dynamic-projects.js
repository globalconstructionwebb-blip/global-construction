/**
 * DYNAMIC PROJECTS LOADER
 * Fetches the 5 latest published projects by category from Supabase
 * and injects them into the landing page carousel.
 * 
 * Usage: window.loadDynamicProjects('konstruktion') or window.loadDynamicProjects('skyddsrum')
 */
(function () {
    const SUPABASE_URL = "https://ubaolkuyccfyurphdmgf.supabase.co";
    const SUPABASE_KEY = "sb_publishable_CfltW1c2YJf0V9jC3poE9Q_FmaBjxCI";

    window.loadDynamicProjects = async function (category) {
        const carousel = document.getElementById('projects-carousel');
        if (!carousel) return;

        const track = carousel.querySelector('.carousel-track');
        const dotsNav = carousel.querySelector('.carousel-dots');
        if (!track) return;

        try {
            // Initialize Supabase client
            const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

            // Fetch 5 latest published projects for this category
            const { data: projects, error } = await _supabase
                .from('projects')
                .select('*')
                .eq('category', category)
                .eq('published', true)
                .order('publish_date', { ascending: false })
                .limit(5);

            if (error) {
                console.error("Fel vid hämtning av projekt för karusell:", error);
                // Fall back to hardcoded content – don't touch anything
                if (window.initProjectsCarousel) window.initProjectsCarousel();
                return;
            }

            if (!projects || projects.length === 0) {
                // No dynamic projects found – keep hardcoded fallback
                console.info("Inga dynamiska projekt hittades för kategori:", category);
                if (window.initProjectsCarousel) window.initProjectsCarousel();
                return;
            }

            // Build new carousel items
            const total = projects.length;
            let trackHTML = '';
            projects.forEach((project, index) => {
                const imgSrc = (project.images && project.images[0]) || project.image_url || 'construction.jpg';
                const title = project.title || 'Projekt';
                const description = project.excerpt || project.description || '';
                const slug = project.slug || '';

                trackHTML += `
                    <article class="project-item" role="group" aria-roledescription="bild" aria-label="Projekt ${index + 1} av ${total}">
                        <img src="${imgSrc}" 
                             alt="${title}" 
                             width="700" height="420" loading="lazy">
                        <div class="project-content">
                            <h3>${title}</h3>
                            <p>${description}</p>
                        </div>
                    </article>
                `;
            });

            // Inject into track
            track.innerHTML = trackHTML;

            // Rebuild dots
            if (dotsNav) {
                let dotsHTML = '';
                for (let i = 0; i < total; i++) {
                    dotsHTML += `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Visa projekt ${i + 1}"${i === 0 ? ' aria-current="true"' : ''}></button>`;
                }
                dotsNav.innerHTML = dotsHTML;
            }

            // Re-initialize the carousel
            if (window.initProjectsCarousel) {
                window.initProjectsCarousel();
            }

        } catch (err) {
            console.error("Oväntat fel vid dynamisk projektladdning:", err);
            // Fall back to hardcoded content
            if (window.initProjectsCarousel) window.initProjectsCarousel();
        }
    };
})();
