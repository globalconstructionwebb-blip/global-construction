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
            let projects = [];
            const { data, error } = await _supabase
                .from('Project')
                .select('*')
                .eq('category', category)
                .eq('published', true)
                .order('createdAt', { ascending: false })
                .limit(5);

            if (error) {
                console.error("Fel vid hämtning av projekt för karusell:", error);
                // Fall back to empty array so placeholders are generated
            } else if (data) {
                projects = data;
            }

            // Build new carousel items (always 5)
            const TOTAL_SLIDES = 5;
            let trackHTML = '';
            
            for (let i = 0; i < TOTAL_SLIDES; i++) {
                if (i < projects.length) {
                    const project = projects[i];
                    const imgSrc = (project.gallery && project.gallery[0]) || project.featuredImage || 'construction.jpg';
                    const title = project.title || 'Projekt';
                    const description = project.metaDescription || '';

                    trackHTML += `
                        <article class="project-item" role="group" aria-roledescription="bild" aria-label="Projekt ${i + 1} av ${TOTAL_SLIDES}">
                            <img src="${imgSrc}" 
                                 alt="${title}" 
                                 width="700" height="420" loading="lazy">
                            <div class="project-content">
                                <h3>${title}</h3>
                                <p>${description}</p>
                            </div>
                        </article>
                    `;
                } else {
                    // Placeholder card
                    trackHTML += `
                        <article class="project-item" role="group" aria-roledescription="bild" aria-label="Projekt ${i + 1} av ${TOTAL_SLIDES}">
                            <img src="construction.jpg" 
                                 alt="Kommande projekt" 
                                 width="700" height="420" loading="lazy" style="filter: grayscale(100%) opacity(0.7);">
                            <div class="project-content">
                                <h3>Information uppdateras snart</h3>
                                <p>Här kommer vi inom kort att presentera fler spännande projekt. Håll utkik för framtida uppdateringar från oss på Global Construction.</p>
                            </div>
                        </article>
                    `;
                }
            }

            // Inject into track
            track.innerHTML = trackHTML;

            // Rebuild dots
            if (dotsNav) {
                let dotsHTML = '';
                for (let i = 0; i < TOTAL_SLIDES; i++) {
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
            // We should still render the 5 placeholders if an unexpected error occurs
            const TOTAL_SLIDES = 5;
            let trackHTML = '';
            for (let i = 0; i < TOTAL_SLIDES; i++) {
                trackHTML += `
                    <article class="project-item" role="group" aria-roledescription="bild" aria-label="Projekt ${i + 1} av ${TOTAL_SLIDES}">
                        <img src="construction.jpg" 
                             alt="Kommande projekt" 
                             width="700" height="420" loading="lazy" style="filter: grayscale(100%) opacity(0.7);">
                        <div class="project-content">
                            <h3>Information uppdateras snart</h3>
                            <p>Här kommer vi inom kort att presentera fler spännande projekt. Håll utkik för framtida uppdateringar från oss på Global Construction.</p>
                        </div>
                    </article>
                `;
            }
            track.innerHTML = trackHTML;
            if (dotsNav) {
                let dotsHTML = '';
                for (let i = 0; i < TOTAL_SLIDES; i++) {
                    dotsHTML += `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Visa projekt ${i + 1}"${i === 0 ? ' aria-current="true"' : ''}></button>`;
                }
                dotsNav.innerHTML = dotsHTML;
            }
            if (window.initProjectsCarousel) {
                window.initProjectsCarousel();
            }
        }
    };
})();
