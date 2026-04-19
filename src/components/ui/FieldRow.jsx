/**
 * FieldRow — herbruikbaar invoerveld met label, prefix/suffix en hint
 */
export default function FieldRow({
  label,
  hint,
  type = 'text',
  value,
  onChange,
  prefix,
  suffix,
  required = false,
  min,
  max,
  step = '1',
  placeholder,
  disabled = false,
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-xs text-neutral-400">{hint}</span>}
      </div>

      <div className="flex items-center gap-0 border border-neutral-300 rounded-lg
                      overflow-hidden focus-within:border-neutral-900 transition-colors
                      bg-white">
        {prefix && (
          <span className="px-3 py-2.5 bg-neutral-100 text-neutral-500 text-sm border-r
                           border-neutral-300 whitespace-nowrap">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 text-sm text-neutral-900 outline-none bg-transparent
                     disabled:text-neutral-400 disabled:bg-neutral-50"
        />
        {suffix && (
          <span className="px-3 py-2.5 bg-neutral-100 text-neutral-500 text-sm border-l
                           border-neutral-300 whitespace-nowrap">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
