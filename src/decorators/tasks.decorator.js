import { decoratorCategory } from "./category.decorator.js";
import { decoratorTagList } from "./tag.decorator.js";

export const decoradorTask = (task) => {
    return{
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        category_id: task.category_id,
        category: task.category  
            ? decoratorCategory(task.category)
            : null,
        tags: task.tags? decoratorTagList(task.tags) : [],
        user_id: task.user_id
    };
}

export const decoradorTaskList = (tasks) => 
    tasks.map(decoradorTask);