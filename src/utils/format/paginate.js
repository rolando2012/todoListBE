export const buildLaravelPaginator = ({ data, total, page, perPage, req }) => {
    const currentPage = parseInt(page, 10) || 1;
    const limit = parseInt(perPage, 10) || 15;
    const lastPage = Math.ceil(total / limit) || 1;

    const from = total > 0 ? (currentPage - 1) * limit + 1 : null;
    const to = total > 0 ? Math.min(currentPage * limit, total) : null;

    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}${req.baseUrl}${req.path}`;

    const getUrl = (p) => (p && p >= 1 && p <= lastPage ? `${baseUrl}?page=${p}&per_page=${limit}` : null);

    return {
        current_page: currentPage,
        data,
        first_page_url: `${baseUrl}?page=1&per_page=${limit}`,
        from,
        last_page: lastPage,
        last_page_url: `${baseUrl}?page=${lastPage}&per_page=${limit}`,
        links: [
            {
                url: getUrl(currentPage - 1),
                label: "&laquo; Previous",
                active: false
            },
            ...Array.from({ length: lastPage }, (_, i) => {
                const p = i + 1;
                return {
                    url: `${baseUrl}?page=${p}&per_page=${limit}`,
                    label: String(p),
                    active: p === currentPage
                };
            }),
            {
                url: getUrl(currentPage + 1),
                label: "Next &raquo;",
                active: false
            }
        ],
        next_page_url: getUrl(currentPage + 1),
        path: baseUrl,
        per_page: limit,
        prev_page_url: getUrl(currentPage - 1),
        to,
        total
    };
};