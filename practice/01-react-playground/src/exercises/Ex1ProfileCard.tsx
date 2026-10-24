/*
 * EXERCISE 1 — Profile card (props + children)            Lesson: 02-react-core/02
 * ---------------------------------------------------------------------------------
 * Flutter version of what you are building:
 *
 *   class ProfileCard extends StatelessWidget {
 *     final String name, role;  final Color avatarColor;  final bool isOnline;
 *     final int followers;      final ValueChanged<String> onFollow;
 *     ...
 *   }
 *
 * GOAL: show 3 different profile cards, using ONE reusable ProfileCard component.
 *
 * TODO 1. Complete the `ProfileCardProps` type:
 *         name: string, role: string, avatarColor?: string, isOnline?: boolean,
 *         followers: number, onFollow: (name: string) => void
 * TODO 2. In ProfileCard, destructure the props (default avatarColor '#6366f1', isOnline false)
 *         and show: the Avatar, the name, the role, "<followers> followers", and a Follow button.
 *         The button must call onFollow(name).
 * TODO 3. In Avatar, show the first letter of the name in a colored circle (the style is ready).
 *         If isOnline is true, also render the small green dot (use `&&`).
 * TODO 4. Finish the `Section` component: it shows its `title` in an <h3> and then its `children`.
 * TODO 5. In Ex1ProfileCard, render 3 ProfileCards with different data inside <Section title="Team">.
 *
 * Helpful CSS classes (from src/index.css): card, stack (Column), row (Row), muted, btn, btn-primary
 */
import type { ReactNode } from 'react'

// TODO 1
type ProfileCardProps = {
  name: string
}

function Avatar({ name, color, isOnline }: { name: string; color: string; isOnline: boolean }) {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: color,
          color: 'white',
          display: 'grid',
          placeItems: 'center',
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        {/* TODO 3: first letter of name — hint: name[0] */}?
      </div>
      {/* TODO 3: when isOnline, show this dot:
      <span
        style={{
          position: 'absolute', right: 0, bottom: 2, width: 14, height: 14,
          borderRadius: '50%', background: '#22c55e', border: '2px solid white',
        }}
      />
      */}
    </div>
  )
}

function ProfileCard({ name }: ProfileCardProps) {
  // TODO 2
  return (
    <div className="card stack" style={{ width: 260 }}>
      <div className="row">
        <Avatar name={name} color="#6366f1" isOnline={false} />
        <h3>{name}</h3>
      </div>
    </div>
  )
}

// TODO 4
function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="stack">TODO</section>
}

export default function Ex1ProfileCard() {
  function handleFollow(name: string) {
    alert(`You followed ${name}`)
  }

  // TODO 5
  return (
    <div className="row wrap">
      <ProfileCard name="Kasun" />
    </div>
  )
}
