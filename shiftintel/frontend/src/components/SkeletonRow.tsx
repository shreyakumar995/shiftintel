export default function SkeletonRow() {
    return (
      <tr className="animate-pulse">
        <td className="px-4 py-3">
          <div className="h-4 w-24 rounded bg-zinc-800" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-16 rounded bg-zinc-800" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-32 rounded bg-zinc-800" />
        </td>
        <td className="px-4 py-3">
          <div className="h-6 w-16 rounded-full bg-zinc-800" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-12 rounded bg-zinc-800" />
        </td>
        <td className="px-4 py-3 text-right">
          <div className="ml-auto h-7 w-20 rounded-md bg-zinc-800" />
        </td>
      </tr>
    )
  }