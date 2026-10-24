// SOLUTION — Exercise 1: Profile card (props + children)
import type { ReactNode } from 'react'

type ProfileCardProps = {
  name: string
  role: string
  avatarColor?: string
  isOnline?: boolean
  followers: number
  onFollow: (name: string) => void
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
        {name[0]}
      </div>
      {isOnline && (
        <span
          title="Online"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#22c55e',
            border: '2px solid white',
          }}
        />
      )}
    </div>
  )
}

function ProfileCard({
  name,
  role,
  avatarColor = '#6366f1',
  isOnline = false,
  followers,
  onFollow,
}: ProfileCardProps) {
  return (
    <div className="card stack" style={{ width: 260 }}>
      <div className="row">
        <Avatar name={name} color={avatarColor} isOnline={isOnline} />
        <div>
          <h3>{name}</h3>
          <p className="muted">{role}</p>
        </div>
      </div>
      <p>
        <strong>{followers}</strong> followers
      </p>
      <button className="btn btn-primary" onClick={() => onFollow(name)}>
        Follow
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="stack">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

export default function Ex1ProfileCard() {
  function handleFollow(name: string) {
    alert(`You followed ${name}`)
  }

  return (
    <Section title="Team">
      <div className="row wrap" style={{ alignItems: 'stretch' }}>
        <ProfileCard name="Kasun" role="Flutter → React dev" isOnline followers={120} onFollow={handleFollow} />
        <ProfileCard name="Amara" role="Designer" avatarColor="#ec4899" followers={980} onFollow={handleFollow} />
        <ProfileCard name="Nimal" role="Backend dev" avatarColor="#0ea5e9" isOnline followers={45} onFollow={handleFollow} />
      </div>
    </Section>
  )
}
