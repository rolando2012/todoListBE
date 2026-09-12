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

export const decoradorTaskSelect = (data) => {
    return{
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        category_id: data.category_id,
        category: data.category_name 
            ? { id: data.category_id, name: data.category_name }
            : null,
        tags: data.tags || [],
        user_id: data.user_id
    };
}

export const decoradorTaskList = (tasks) => 
    tasks.map(decoradorTaskSelect);