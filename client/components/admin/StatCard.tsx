type Props = {
  title: string
  value: string | number
}

export default function StatCard({ title, value }: Props) {

  return (

    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="text-2xl font-semibold mt-2 text-white">
        {value}
      </h3>

    </div>

  )
}