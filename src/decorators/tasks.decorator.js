export const decoradorTask = (data) => {
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        state: data.state,
        category_id: data.category_id || null,
        tags: data.tags || [],
        user_id: data.user_id
    };
}