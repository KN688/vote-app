export default function OptionItem({ option, selected, onClick, disabled, showPercent }) {
  const percent = showPercent ? ((option.count / (option.totalVotes || 1)) * 100).toFixed(1) : 0

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-primary-500 bg-green-50'
          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? 'border-primary-500' : 'border-gray-400'
        }`}>
          {selected && <div className="w-3 h-3 rounded-full bg-primary-500"></div>}
        </div>
        <span className="flex-1 font-medium text-gray-900">{option.name}</span>
        {showPercent && (
          <span className="text-sm font-bold text-primary-600">{option.count}票</span>
        )}
      </div>

      {showPercent && (
        <>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <div className="text-right text-sm text-gray-600 mt-1">{percent}%</div>
        </>
      )}
    </div>
  )
}