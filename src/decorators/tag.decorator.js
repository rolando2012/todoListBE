export const decoratorTag = (tag) => {
    return {
        id: tag.id,
        name: tag.name,
        user_id: tag.user_id,
        tasks_count: tag.tasks_count || 0
    }
}

export const decoratorTagList = (tags) => 
    tags.map(decoratorTag)