// One row in the list. Styled with a CSS Module (scoped class names).
import { Link } from 'react-router'
import { useTasks } from '../state/TasksContext.tsx'
import type { Task } from '../types.ts'
import styles from './TaskItem.module.css'

export default function TaskItem({ task }: { task: Task }) {
  const { dispatch } = useTasks()

  return (
    <li className={styles.item}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={task.done}
        onChange={() => dispatch({ type: 'toggled', id: task.id })}
        aria-label={`Mark "${task.title}" as ${task.done ? 'not done' : 'done'}`}
      />
      <Link to={`/tasks/${task.id}`} className={task.done ? `${styles.title} ${styles.done}` : styles.title}>
        {task.title}
      </Link>
      <span className={`${styles.priority} ${styles[task.priority]}`}>{task.priority}</span>
      <button
        className={styles.delete}
        onClick={() => dispatch({ type: 'deleted', id: task.id })}
        aria-label={`Delete "${task.title}"`}
      >
        ✕
      </button>
    </li>
  )
}
