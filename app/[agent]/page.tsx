import { redirect } from 'next/navigation'
import { AGENTS } from '@/lib/constants'

interface PageProps {
  params: Promise<{ agent: string }>
}

export default async function AgentPage({ params }: PageProps) {
  const { agent } = await params
  const valid = AGENTS.some(a => a.id === agent)
  if (valid) {
    redirect(`/?agent=${agent}#comparison`)
  }
  redirect('/')
}
