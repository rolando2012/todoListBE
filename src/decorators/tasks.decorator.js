export const decoradorTask = (task) => {
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        state: task.state,
        category_id: task.category_id || null,
        tags: task.tags || [],
        user_id: task.user_id
    };
}

export const decoradorTaskSelect = (task) => {
    return{
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        category_id: task.category_id,
        category: task.category_name 
            ? { id: task.category_id, name: task.category_name }
            : null,
        tags: task.tags || [],
        user_id: task.user_id
    };
}

export const decoradorTaskList = (tasks) => 
    tasks.map(decoradorTaskSelect);