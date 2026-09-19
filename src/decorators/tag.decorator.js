export const decoratorTag = (tag) => {
    return {
        id: tag.id,
        name: tag.name,
        user_id: tag.user_id
    }
}

export const decoratorTagList = (tags) => 
    tags.map(decoratorTag)