export const decoratorCategory = (category) => {
    return {
        id: category.id,
        name: category.name,
        user_id: category.user_id,
        tasks_count: category.tasks_count || 0
    }
}

export const decoratorCategoryList = (categories) => 
    categories.map(decoratorCategory);