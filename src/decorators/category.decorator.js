export const decoratorCategory = (category) => {
    return {
        id: category.id,
        name: category.name,
        user_id: category.user_id,
        created_at: category.created_at || null,
        updated_at: category.updated_at || null
    }
}

export const decoratorCategoryList = (categories) => 
    categories.map(decoratorCategory);