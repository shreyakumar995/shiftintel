type Props = {
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
}

const colors = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-amber-100 text-amber-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800'
}

export default function SeverityBadge({ severity }: Props) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[severity]}`}>
      {severity}
    </span>
  )
}
