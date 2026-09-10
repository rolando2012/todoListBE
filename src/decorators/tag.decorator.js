export const decoratorTag = (tag) => {
    return {
        id: tag.id,
        name: tag.name,
        user_id: tag.user_id,
        created_at: tag.created_at || null,
        updated_at: tag.updated_at || null
    }
}

export const decoratorTagList = (tags) => 
    tags.map(decoratorTag)