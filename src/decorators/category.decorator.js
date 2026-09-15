export const decoratorCategory = (category) => {
    return {
        id: category.id,
        name: category.name,
        user_id: category.user_id
    }
}

export const decoratorCategoryList = (categories) => 
    categories.map(decoratorCategory);